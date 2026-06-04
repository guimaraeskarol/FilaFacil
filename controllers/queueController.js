const Database = require("../models/database");
const db = new Database();

// Listar filas de um estabelecimento
exports.list = async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  try {
    const { establishmentId } = req.params;

    // Verificar se o estabelecimento pertence ao usuário
    const establishment = await db.get(
      "SELECT * FROM establishments WHERE id = ? AND userId = ?",
      [establishmentId, req.session.user.id]
    );

    if (!establishment) {
      return res.status(404).render("error", { error: "Estabelecimento não encontrado" });
    }

    const queues = await db.all(
      "SELECT * FROM queues WHERE establishmentId = ? ORDER BY createdAt DESC",
      [establishmentId]
    );

    res.render("queues/list", {
      title: "Filas",
      establishment,
      queues
    });
  } catch (error) {
    console.error("Erro ao listar filas:", error);
    res.status(500).render("error", { error: "Erro ao listar filas" });
  }
};

// Página de criar fila
exports.createPage = async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  try {
    const establishment = await db.get(
      "SELECT * FROM establishments WHERE id = ? AND userId = ?",
      [req.params.establishmentId, req.session.user.id]
    );

    if (!establishment) {
      return res.status(404).render("error", { error: "Estabelecimento não encontrado" });
    }

    res.render("queues/create", {
      title: "Nova Fila",
      establishment
    });
  } catch (error) {
    console.error("Erro ao carregar página de criar fila:", error);
    res.status(500).render("error", { error: "Erro ao carregar página" });
  }
};

// Criar fila
exports.create = async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  const { establishmentId } = req.params;
  const { name, description, maxCapacity, averageServiceTime } = req.body;

  if (!name || !maxCapacity || !averageServiceTime) {
    return res.render("queues/create", {
      error: "Nome, capacidade máxima e tempo médio são obrigatórios"
    });
  }

  try {
    // Verificar se o estabelecimento pertence ao usuário
    const establishment = await db.get(
      "SELECT * FROM establishments WHERE id = ? AND userId = ?",
      [establishmentId, req.session.user.id]
    );

    if (!establishment) {
      return res.status(404).render("error", { error: "Estabelecimento não encontrado" });
    }

    await db.run(
      `INSERT INTO queues (establishmentId, name, description, maxCapacity, averageServiceTime, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [establishmentId, name, description, maxCapacity, averageServiceTime, "active"]
    );

    res.redirect(`/queues/establishment/${establishmentId}`);
  } catch (error) {
    console.error("Erro ao criar fila:", error);
    res.status(500).render("error", { error: "Erro ao criar fila" });
  }
};

// Visualizar detalhes da fila
exports.view = async (req, res) => {
  try {
    const queue = await db.get(
      `SELECT q.*, e.name as establishmentName, e.userId as ownerId FROM queues q
       JOIN establishments e ON q.establishmentId = e.id
       WHERE q.id = ?`,
      [req.params.id]
    );

    if (!queue) {
      return res.status(404).render("error", { error: "Fila não encontrada" });
    }

    // Buscar usuários na fila
    const queueUsers = await db.all(
      `SELECT qu.*, u.name, u.email FROM queue_users qu
       JOIN users u ON qu.userId = u.id
       WHERE qu.queueId = ? AND qu.status = 'waiting'
       ORDER BY qu.position ASC`,
      [req.params.id]
    );

    // Calcular tempo estimado de espera
    const totalWaitTime = queueUsers.length * queue.averageServiceTime;
    const isOwner = req.session.user ? req.session.user.id === queue.ownerId : false;
    const showQueueActions = req.session.user ? req.session.user.role === 'user' && !isOwner : false;

    res.render("queues/view", {
      title: `Fila: ${queue.name}`,
      queue,
      queueUsers,
      totalWaitTime,
      userPosition: showQueueActions ? queueUsers.findIndex(qu => qu.userId === req.session.user.id) + 1 : null,
      showQueueActions,
      showUserPosition: showQueueActions,
      isAuthenticated: !!req.session.user
    });
  } catch (error) {
    console.error("Erro ao visualizar fila:", error);
    res.status(500).render("error", { error: "Erro ao visualizar fila" });
  }
};

// API: listar filas de um estabelecimento (JSON)
exports.apiList = async (req, res) => {
  try {
    const { establishmentId } = req.params;
    const queues = await db.all(
      "SELECT id, name, description FROM queues WHERE establishmentId = ? ORDER BY createdAt DESC",
      [establishmentId]
    );

    res.json({ success: true, queues });
  } catch (error) {
    console.error('Erro ao buscar filas (API):', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar filas' });
  }
};

// Entrar na fila
exports.join = async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  try {
    const queue = await db.get("SELECT * FROM queues WHERE id = ?", [req.params.id]);

    if (!queue) {
      return res.status(404).json({ error: "Fila não encontrada" });
    }

    // Verificar se já está na fila
    const existingUser = await db.get(
      "SELECT * FROM queue_users WHERE queueId = ? AND userId = ? AND status = 'waiting'",
      [req.params.id, req.session.user.id]
    );

    if (existingUser) {
      return res.status(400).json({ error: "Você já está nesta fila" });
    }

    // Contar posição
    const lastPosition = await db.get(
      "SELECT MAX(position) as maxPosition FROM queue_users WHERE queueId = ?",
      [req.params.id]
    );

    const position = (lastPosition?.maxPosition || 0) + 1;

    await db.run(
      `INSERT INTO queue_users (queueId, userId, position, status)
       VALUES (?, ?, ?, ?)`,
      [req.params.id, req.session.user.id, position, "waiting"]
    );

    res.json({ success: true, position });
  } catch (error) {
    console.error("Erro ao entrar na fila:", error);
    res.status(500).json({ error: "Erro ao entrar na fila" });
  }
};

// Entrar na fila como convidado (sem sessão de usuário)
exports.guestJoin = async (req, res) => {
  try {
    const { id } = req.params; // queue id
    const { name, phone } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Nome é obrigatório' });
    }

    const queue = await db.get('SELECT * FROM queues WHERE id = ?', [id]);
    if (!queue) return res.status(404).json({ success: false, error: 'Fila não encontrada' });

    // Criar usuário temporário com role 'guest'
    const guestEmail = `guest_${Date.now()}@guest.local`;
    const result = await db.run(
      `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
      [name, guestEmail, 'guest', 'guest']
    );

    const guestId = result.id;

    // Criar sessão para o usuário convidado (logar automaticamente)
    try {
      if (req && req.session) {
        req.session.user = { id: guestId, name, role: 'guest' };
      }
    } catch (e) {
      console.error('Erro ao criar sessão para guest:', e);
    }

    // Verificar posição
    const lastPosition = await db.get('SELECT MAX(position) as maxPosition FROM queue_users WHERE queueId = ?', [id]);
    const position = (lastPosition?.maxPosition || 0) + 1;

    await db.run(
      `INSERT INTO queue_users (queueId, userId, position, status) VALUES (?, ?, ?, ?)`,
      [id, guestId, position, 'waiting']
    );

    // Emitir evento via socket.io se disponível (opcional)
    try {
      if (global.io) {
        global.io.to(`queue_${id}`).emit('user-joined', { queueId: id, user: { id: guestId, name, phone }, position });
      }
    } catch (e) {
      console.error('Erro ao emitir evento socket:', e);
    }

    res.json({ success: true, position, user: { id: guestId, name } });
  } catch (error) {
    console.error('Erro ao entrar como convidado:', error);
    res.status(500).json({ success: false, error: 'Erro ao entrar na fila' });
  }
};

// Sair da fila
exports.leave = async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  try {
    await db.run(
      "UPDATE queue_users SET status = 'cancelled' WHERE queueId = ? AND userId = ?",
      [req.params.id, req.session.user.id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Erro ao sair da fila:", error);
    res.status(500).json({ error: "Erro ao sair da fila" });
  }
};

// Chamar próximo atendimento (admin)
exports.callNext = async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  try {
    const queue = await db.get(
      "SELECT q.* FROM queues q JOIN establishments e ON q.establishmentId = e.id WHERE q.id = ? AND e.userId = ?",
      [req.params.id, req.session.user.id]
    );

    if (!queue) {
      return res.status(403).json({ error: "Você não tem permissão" });
    }

    // Buscar próximo usuário com nome
    const nextUser = await db.get(
      `SELECT qu.*, u.name FROM queue_users qu
       JOIN users u ON qu.userId = u.id
       WHERE qu.queueId = ? AND qu.status = 'waiting'
       ORDER BY qu.position ASC LIMIT 1`,
      [req.params.id]
    );

    if (!nextUser) {
      return res.status(400).json({ error: "Nenhum usuário na fila" });
    }

    // Atualizar status
    await db.run(
      "UPDATE queue_users SET status = 'called', calledAt = CURRENT_TIMESTAMP WHERE id = ?",
      [nextUser.id]
    );

    // Criar registro de atendimento
    await db.run(
      `INSERT INTO attendance_history (queueId, userId, startTime)
       VALUES (?, ?, CURRENT_TIMESTAMP)`,
      [req.params.id, nextUser.userId]
    );

    // Emitir via socket.io para notificar clientes conectados (se disponível)
    try {
      if (global.io) {
        global.io.to(`queue_${req.params.id}`).emit('user-called', { queueId: req.params.id, user: nextUser });
      }
    } catch (e) {
      console.error('Erro ao emitir evento socket user-called:', e);
    }

    res.json({ success: true, user: nextUser });
  } catch (error) {
    console.error("Erro ao chamar próximo:", error);
    res.status(500).json({ error: "Erro ao chamar próximo" });
  }
};

// Finalizar atendimento
exports.finishAttendance = async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  try {
    const { queueUserId } = req.body;

    // Atualizar status
    await db.run(
      "UPDATE queue_users SET status = 'completed' WHERE id = ?",
      [queueUserId]
    );

    // Atualizar histórico
    await db.run(
      "UPDATE attendance_history SET endTime = CURRENT_TIMESTAMP WHERE queueId = ? AND userId = (SELECT userId FROM queue_users WHERE id = ?)",
      [req.params.id, queueUserId]
    );

    // Emitir evento de cliente atendido
    try {
      if (global.io) {
        global.io.to(`queue_${req.params.id}`).emit('user-served', { queueId: req.params.id, queueUserId });
      }
    } catch (e) {
      console.error('Erro ao emitir evento socket user-served:', e);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Erro ao finalizar atendimento:", error);
    res.status(500).json({ error: "Erro ao finalizar atendimento" });
  }
};

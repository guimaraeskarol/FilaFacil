const Database = require("../models/database");
const db = new Database();

exports.index = (req, res) => {
  res.render("index", {
    title: "FilaFácil - Gerenciamento de Filas Digitais"
  });
};

exports.about = (req, res) => {
  res.render("about", {
    title: "Sobre FilaFácil"
  });
};

exports.contact = (req, res) => {
  res.render("contact", {
    title: "Contato"
  });
};

exports.dashboard = async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  try {
    const user = req.session.user;

    // Buscar estabelecimentos do usuário
    const establishments = await db.all(
      "SELECT * FROM establishments WHERE userId = ?",
      [user.id]
    );

    // Buscar filas do usuário (como participante)
    const myQueues = await db.all(
      `SELECT q.*, e.name as establishmentName FROM queues q
       JOIN queue_users qu ON q.id = qu.queueId
       JOIN establishments e ON q.establishmentId = e.id
       WHERE qu.userId = ? AND qu.status = 'waiting'`,
      [user.id]
    );

    res.render("dashboard", {
      title: "Dashboard - FilaFácil",
      user,
      establishments,
      myQueues
    });
  } catch (error) {
    console.error("Erro ao carregar dashboard:", error);
    res.status(500).render("error", { error: "Erro ao carregar dashboard" });
  }
};

exports.profile = async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  try {
    const userFromDb = await db.get(
      "SELECT id, name, email, role, createdAt FROM users WHERE id = ?",
      [req.session.user.id]
    );

    if (!userFromDb) {
      return res.redirect("/logout");
    }

    // Formatar data de cadastro
    let formattedDate = "Não disponível";
    if (userFromDb.createdAt) {
      const date = new Date(userFromDb.createdAt);
      // Converter para formato local PT-BR (DD/MM/AAAA)
      formattedDate = date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
    }

    // Criar objeto completo para a view
    const user = {
      ...userFromDb,
      createdAtFormatted: formattedDate,
      isAdmin: userFromDb.role === "admin"
    };

    res.render("profile", {
      title: "Meu Perfil",
      user
    });
  } catch (error) {
    console.error("Erro ao carregar perfil:", error);
    res.status(500).render("error", { error: "Erro ao carregar perfil" });
  }
};

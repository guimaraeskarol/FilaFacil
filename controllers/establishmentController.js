const Database = require("../models/database");
const db = new Database();

// Listar estabelecimentos
exports.list = async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  try {
    let establishments;
    let title;

    if (req.session.user.role === "admin") {
      establishments = await db.all(
        "SELECT * FROM establishments WHERE userId = ? ORDER BY createdAt DESC",
        [req.session.user.id]
      );
      title = "Meus Estabelecimentos";
    } else {
      establishments = await db.all(
        "SELECT * FROM establishments ORDER BY name ASC"
      );
      title = "Minhas Filas";
    }

    res.render("establishments/list", {
      title,
      establishments
    });
  } catch (error) {
    console.error("Erro ao listar estabelecimentos:", error);
    res.status(500).render("error", { error: "Erro ao listar estabelecimentos" });
  }
};

// Página de criar estabelecimento
exports.createPage = (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  res.render("establishments/create", {
    title: "Novo Estabelecimento"
  });
};

// Criar estabelecimento
exports.create = async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  const { name, type, address, city, state, phone, openingHours, closingHours } = req.body;

  if (!name || !type || !address) {
    return res.render("establishments/create", {
      error: "Nome, tipo e endereço são obrigatórios"
    });
  }

  try {
    await db.run(
      `INSERT INTO establishments (userId, name, type, address, city, state, phone, openingHours, closingHours)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.session.user.id, name, type, address, city, state, phone, openingHours, closingHours]
    );

    res.render("establishments/create", {
      success: "Estabelecimento criado com sucesso!"
    });
  } catch (error) {
    console.error("Erro ao criar estabelecimento:", error);
    res.render("establishments/create", {
      error: "Erro ao criar estabelecimento"
    });
  }
};

// Página de editar estabelecimento
exports.editPage = async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  try {
    const establishment = await db.get(
      "SELECT * FROM establishments WHERE id = ? AND userId = ?",
      [req.params.id, req.session.user.id]
    );

    if (!establishment) {
      return res.status(404).render("error", { error: "Estabelecimento não encontrado" });
    }

    res.render("establishments/edit", {
      title: "Editar Estabelecimento",
      establishment
    });
  } catch (error) {
    console.error("Erro ao carregar estabelecimento:", error);
    res.status(500).render("error", { error: "Erro ao carregar estabelecimento" });
  }
};

// Atualizar estabelecimento
exports.update = async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  const { name, type, address, city, state, phone, openingHours, closingHours } = req.body;

  try {
    await db.run(
      `UPDATE establishments SET name = ?, type = ?, address = ?, city = ?, state = ?, phone = ?, openingHours = ?, closingHours = ?
       WHERE id = ? AND userId = ?`,
      [name, type, address, city, state, phone, openingHours, closingHours, req.params.id, req.session.user.id]
    );

    res.redirect("/establishments");
  } catch (error) {
    console.error("Erro ao atualizar estabelecimento:", error);
    res.status(500).render("error", { error: "Erro ao atualizar estabelecimento" });
  }
};

// Deletar estabelecimento
exports.delete = async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  try {
    await db.run(
      "DELETE FROM establishments WHERE id = ? AND userId = ?",
      [req.params.id, req.session.user.id]
    );

    res.redirect("/establishments");
  } catch (error) {
    console.error("Erro ao deletar estabelecimento:", error);
    res.status(500).render("error", { error: "Erro ao deletar estabelecimento" });
  }
};

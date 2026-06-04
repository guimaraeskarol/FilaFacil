const Database = require("../models/database");
const bcrypt = require("bcryptjs");
const db = new Database();

exports.registerPage = (req, res) => {
  res.render("register", {
    title: "Registrar - FilaFácil"
  });
};

exports.register = async (req, res) => {
  const { name, email, password, confirmPassword, role } = req.body;

  // Validações
  if (!name || !email || !password || !confirmPassword) {
    return res.render("register", {
      error: "Todos os campos são obrigatórios"
    });
  }

  if (password !== confirmPassword) {
    return res.render("register", {
      error: "As senhas não coincidem"
    });
  }

  if (password.length < 6) {
    return res.render("register", {
      error: "A senha deve ter no mínimo 6 caracteres"
    });
  }

  // Validar a role para garantir consistência
  const userRole = role === "admin" ? "admin" : "user";

  try {
    // Verificar se email já existe
    const existingUser = await db.get(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingUser) {
      return res.render("register", {
        error: "Este email já está registrado"
      });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário com a role correta
    await db.run(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, userRole]
    );

    return res.render("register", {
      success: "Usuário registrado com sucesso! Faça login para continuar."
    });
  } catch (error) {
    console.error("Erro ao registrar:", error);
    res.render("register", {
      error: "Erro ao registrar usuário"
    });
  }
};

exports.loginPage = (req, res) => {
  res.render("login", {
    title: "Login - FilaFácil"
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render("login", {
      error: "Email e senha são obrigatórios"
    });
  }

  try {
    const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);

    if (!user) {
      return res.render("login", {
        error: "Email ou senha incorretos"
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.render("login", {
        error: "Email ou senha incorretos"
      });
    }

    // Salvar sessão
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    // Redirecionamento condicional baseado na role
    if (user.role === "admin") {
      return res.redirect("/dashboard");
    } else {
      return res.redirect("/");
    }
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.render("login", {
      error: "Erro ao fazer login"
    });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("/dashboard");
    }
    res.redirect("/");
  });
};

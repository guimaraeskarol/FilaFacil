const express = require("express");
const { engine } = require("express-handlebars");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
const http = require("http");
const socketIO = require("socket.io");

const routes = require("./routes");
const Database = require("./models/database");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
// Tornar acessível globalmente para controllers que emitem eventos
global.io = io;

// Inicializar banco de dados
const db = new Database();
db.initialize();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Sessão
app.use(
  session({
    secret: "filafacil-secret-key-2026",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 } // 24 horas
  })
);

// Handlebars
app.engine(
  "handlebars",
  engine({
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views/layouts"),
    partialsDir: path.join(__dirname, "views/partials"),
    helpers: {
      eq: (a, b) => a === b
    }
  })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Arquivos estáticos
app.use(express.static(path.join(__dirname, "views/css")));
app.use(express.static(path.join(__dirname, "views/js")));
app.use(express.static(path.join(__dirname, "public")));

// Middleware para passar dados globais para as views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.isAuthenticated = !!req.session.user;
  next();
});

// Rotas
app.use("/", routes);

// Socket.IO - Gerenciamento de filas em tempo real
io.on("connection", (socket) => {
  console.log("Novo cliente conectado:", socket.id);

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });

  // Eventos para filas
  socket.on("join-queue", (data) => {
    socket.emit("queue-update", { message: "Você entrou na fila" });
  });

  socket.on("leave-queue", (data) => {
    socket.emit("queue-update", { message: "Você saiu da fila" });
  });

  // Inscrever socket em uma sala de fila específica
  socket.on('subscribeQueue', (data) => {
    try {
      const qid = data && data.queueId;
      if (qid) {
        socket.join(`queue_${qid}`);
        console.log(`Socket ${socket.id} entrou na sala queue_${qid}`);
      }
    } catch (e) {
      console.error('Erro ao inscrever em sala de fila:', e);
    }
  });

  // Reemitir eventos 'user-joined' vindos de clientes para a sala correspondente
  socket.on('user-joined', (data) => {
    try {
      const qid = data && data.queueId;
      if (qid) {
        io.to(`queue_${qid}`).emit('user-joined', data);
      }
    } catch (e) {
      console.error('Erro ao rebroadcast user-joined:', e);
    }
  });
});

// Tratamento de erros 404
app.use((req, res) => {
  res.status(404).render("404");
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 FilaFácil rodando em http://localhost:${PORT}`);
});

module.exports = { app, io };

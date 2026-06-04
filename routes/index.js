const express = require("express");
const router = express.Router();

const mainController = require("../controllers/mainController");
const authController = require("../controllers/authController");
const establishmentController = require("../controllers/establishmentController");
const queueController = require("../controllers/queueController");

// Rotas públicas
router.get("/", mainController.index);
router.get("/about", mainController.about);
router.get("/contact", mainController.contact);

// Rotas de autenticação
router.get("/register", authController.registerPage);
router.post("/register", authController.register);
router.get("/login", authController.loginPage);
router.post("/login", authController.login);
router.get("/logout", authController.logout);

// Rotas de dashboard
router.get("/dashboard", mainController.dashboard);
router.get("/profile", mainController.profile);

// Rotas de estabelecimentos
router.get("/establishments", establishmentController.list);
router.get("/establishments/create", establishmentController.createPage);
router.post("/establishments/create", establishmentController.create);
router.get("/establishments/edit/:id", establishmentController.editPage);
router.post("/establishments/edit/:id", establishmentController.update);
router.get("/establishments/delete/:id", establishmentController.delete);

// Rotas de filas
router.get("/queues/establishment/:establishmentId", queueController.list);
// API: retornar filas em JSON para um estabelecimento
router.get("/api/queues/establishment/:establishmentId", queueController.apiList);
router.post("/guest/queues/:id/join", queueController.guestJoin);
router.get("/queues/create/:establishmentId", queueController.createPage);
router.post("/queues/create/:establishmentId", queueController.create);
router.get("/queues/:id", queueController.view);
router.post("/queues/:id/join", queueController.join);
router.post("/queues/:id/leave", queueController.leave);
router.post("/queues/:id/call-next", queueController.callNext);
router.post("/queues/:id/finish-attendance", queueController.finishAttendance);

module.exports = router;

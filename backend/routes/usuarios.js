// backend/routes/usuarios.js
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// Ruta para registrar: POST /api/usuarios
router.post('/registro', usuarioController.registrarUsuario);

// Login: POST /api/usuarios/login
router.post('/login', usuarioController.loginUsuario);

module.exports = router;
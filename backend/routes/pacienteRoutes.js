const express = require('express');
const router = express.Router();
const pacienteController = require('../controllers/pacienteController');

router.post('/', pacienteController.crearPaciente);
router.get('/', pacienteController.obtenerPacientes);
router.get('/:id', pacienteController.obtenerPaciente);
router.delete('/:id', pacienteController.eliminarPaciente);

module.exports = router;
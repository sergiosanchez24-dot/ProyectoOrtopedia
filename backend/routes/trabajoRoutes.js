const express = require('express');
const router = express.Router();
const trabajoController = require('../controllers/trabajoController');

router.post('/', trabajoController.crearTrabajo);
router.get('/paciente/:pacienteId', trabajoController.obtenerTrabajosPorPaciente);
router.put('/:id/estado', trabajoController.actualizarEstadoTrabajo);
router.post('/:id/materiales', trabajoController.agregarMaterial);
router.delete('/:id/materiales/:materialId', trabajoController.eliminarMaterial);

module.exports = router;
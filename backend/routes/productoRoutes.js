const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const multer = require('multer');
const path = require('path');

// Configuración de Multer (Dónde y cómo se guardan los archivos)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Carpeta donde se guardan
    },
    filename: function (req, file, cb) {
        // Le ponemos la fecha al nombre para que no se repitan
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Rutas
router.get('/', productoController.obtenerProductos);

// AÑADIMOS 'upload.single' PARA PROCESAR 1 IMAGEN
router.post('/', upload.single('imagen'), productoController.crearProducto);

router.put('/:id', productoController.actualizarProducto);
router.delete('/:id', productoController.eliminarProducto);
router.get('/:id', productoController.obtenerProducto);

module.exports = router;
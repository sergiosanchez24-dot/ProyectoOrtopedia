const mongoose = require('mongoose');

const ProductoSchema = mongoose.Schema({
    nombre: { type: String, required: true },
    categoria: { type: [String], default: [] },
    stock: { type: Number, required: true, default: 0 },
    precio: { type: Number, required: true, default: 0 },
    descripcion: { type: String, default: '' },
    imagen: { type: String, default: '' },
    fechaCreacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Producto', ProductoSchema);
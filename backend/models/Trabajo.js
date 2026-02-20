const mongoose = require('mongoose');

const TrabajoSchema = new mongoose.Schema({
    paciente: { type: mongoose.Schema.Types.ObjectId, ref: 'Paciente', required: true },
    titulo: { type: String, required: true },
    descripcion: { type: String },
    estado: { 
        type: String, 
        enum: ['Valoración', 'Presupuesto', 'Fabricación', 'Prueba', 'Entrega'], 
        default: 'Valoración' 
    },

    materiales: [{
        producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' }, // Conectamos con el inventario
        cantidad: { type: Number, default: 1 },
        descontado: { type: Boolean, default: false } // Candado individual
    }],

    fechaInicio: { type: Date, default: Date.now },
    fechaActualizacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trabajo', TrabajoSchema);
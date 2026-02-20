const mongoose = require('mongoose');

const PacienteSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    telefono: { type: String, required: true },
    dni: { type: String },
    edad: { type: Number },
    diagnostico: { type: String },
    notas: { type: String },
    fechaAlta: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Paciente', PacienteSchema);
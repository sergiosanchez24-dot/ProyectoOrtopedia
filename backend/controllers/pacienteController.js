const Paciente = require('../models/Paciente');

exports.crearPaciente = async (req, res) => {
    try {
        const nuevoPaciente = new Paciente(req.body);
        await nuevoPaciente.save();
        res.status(201).json(nuevoPaciente);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear paciente' });
    }
};

exports.obtenerPacientes = async (req, res) => {
    try {
        const pacientes = await Paciente.find().sort({ fechaAlta: -1 }); // Los más nuevos primero
        res.json(pacientes);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener pacientes' });
    }
};

exports.obtenerPaciente = async (req, res) => {
    try {
        const paciente = await Paciente.findById(req.params.id);
        if (!paciente) {
            return res.status(404).json({ msg: 'Paciente no encontrado' });
        }
        res.json(paciente);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el paciente' });
    }
};

// Eliminar un paciente
exports.eliminarPaciente = async (req, res) => {
    try {
        const paciente = await Paciente.findByIdAndDelete(req.params.id);
        if (!paciente) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }
        res.json({ mensaje: 'Paciente eliminado correctamente' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al eliminar el paciente' });
    }
};
// backend/index.js

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const pacienteRoutes = require('./routes/pacienteRoutes');
const trabajoRoutes = require('./routes/trabajoRoutes');
require('dotenv').config(); // Llama a tu archivo .env con la contraseña

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/productos', require('./routes/productoRoutes'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/pacientes', pacienteRoutes);
app.use('/api/trabajos', trabajoRoutes);

// --- CONEXIÓN A LA BASE DE DATOS ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('🟢 Conectado con éxito a la Base de Datos'))
  .catch((error) => console.log('🔴 Error al conectar a la BD:', error));

// Ruta base de prueba
app.get('/', (req, res) => {
    res.send('¡API de la Ortopedia funcionando perfectamente! 🚀');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor rodando en http://localhost:${PORT}`);
});
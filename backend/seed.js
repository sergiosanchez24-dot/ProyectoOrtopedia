const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Producto = require('./models/Producto');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🟢 Conectado para limpiar DB'))
    .catch(err => { console.error(err); process.exit(1); });

const limpiarDatos = async () => {
    try {
        // ESTO BORRA TODO LO QUE HAYA EN PRODUCTOS
        await Producto.deleteMany();
        console.log('🧹 ¡Base de datos limpia! Lista para productos reales.');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

limpiarDatos();
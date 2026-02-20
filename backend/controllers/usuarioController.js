// backend/controllers/usuarioController.js
const Usuario = require('../models/Usuario');

// Lógica para registrar un nuevo usuario
exports.registrarUsuario = async (req, res) => {
    try {
        const { nombre, email, password, rol } = req.body;

        // 1. Comprobar si el usuario ya existe
        let usuario = await Usuario.findOne({ email });
        if (usuario) return res.status(400).json({ msg: 'El usuario ya existe' });

        // 2. Crear el nuevo usuario
        usuario = new Usuario({ nombre, email, password, rol });
        
        // 3. Guardar en MongoDB
        await usuario.save();

        res.json({ msg: 'Usuario creado correctamente', usuario });
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error al registrar');
    }
};

// Lógica para el Login
exports.loginUsuario = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Buscar si el usuario existe por su email
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(400).json({ msg: 'El usuario no existe' });
        }

        // 2. Comprobar si la contraseña coincide
        // (Nota: Más adelante la encriptaremos por seguridad, ahora comparamos texto)
        if (usuario.password !== password) {
            return res.status(400).json({ msg: 'Contraseña incorrecta' });
        }

        // 3. Si todo coincide, ¡adentro!
        res.json({ 
            msg: 'Login exitoso', 
            usuario: {
                id: usuario._id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error en el login');
    }
};
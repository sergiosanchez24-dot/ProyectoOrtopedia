const Producto = require('../models/Producto');

// Obtener todos los productos
exports.obtenerProductos = async (req, res) => {
    try {
        const productos = await Producto.find();
        res.json(productos);
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error al obtener productos');
    }
};

// Crear un producto nuevo
exports.crearProducto = async (req, res) => {
    try {
        const { nombre, descripcion, precio, stock, categoria, imagen } = req.body;
        
        let imagenFinal = null;

        // 1. Si el usuario subió un archivo desde su PC (req.file)
        if (req.file) {
            imagenFinal = `http://localhost:5000/uploads/${req.file.filename}`;
        } 
        // 2. Si el usuario pegó un enlace de internet en el formulario
        else if (imagen) {
            imagenFinal = imagen;
        }

        const producto = new Producto({
            nombre,
            descripcion,
            precio,
            stock,
            categoria,
            imagen: imagenFinal // Guardamos el enlace o la ruta del archivo
        });

        await producto.save();
        res.json(producto);
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error al crear el producto');
    }
};

// Actualizar un producto
exports.actualizarProducto = async (req, res) => {
    try {
        let producto = await Producto.findById(req.params.id);

        if (!producto) {
            return res.status(404).json({ msg: 'No existe el producto' });
        }

        // findOneAndUpdate busca por ID y le inyecta los nuevos datos (req.body)
        producto = await Producto.findOneAndUpdate(
            { _id: req.params.id }, 
            req.body, 
            { new: true }
        );

        res.json(producto);
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error al actualizar el producto');
    }
};

// Eliminar un producto
exports.eliminarProducto = async (req, res) => {
    try {
        let producto = await Producto.findById(req.params.id);

        if (!producto) {
            return res.status(404).json({ msg: 'No existe el producto' });
        }

        await Producto.findOneAndDelete({ _id: req.params.id });
        res.json({ msg: 'Producto eliminado con éxito' });
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error al eliminar el producto');
    }
};

// Obtener un solo producto por su ID
exports.obtenerProducto = async (req, res) => {
    try {
        let producto = await Producto.findById(req.params.id);
        if (!producto) {
            return res.status(404).json({ msg: 'No existe el producto' });
        }
        res.json(producto);
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error al obtener el producto');
    }
};
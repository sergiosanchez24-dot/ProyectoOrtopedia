const Trabajo = require('../models/Trabajo');
const Producto = require('../models/Producto');

// 1. Crear una nueva orden de taller
exports.crearTrabajo = async (req, res) => {
    try {
        const nuevoTrabajo = new Trabajo(req.body);
        await nuevoTrabajo.save();
        res.status(201).json(nuevoTrabajo);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al crear la orden de taller' });
    }
};

// 2. Buscar todos los trabajos de un paciente
exports.obtenerTrabajosPorPaciente = async (req, res) => {
    try {
        const trabajos = await Trabajo.find({ paciente: req.params.pacienteId })
            .populate('materiales.producto') // Trae los datos de la pieza
            .sort({ fechaInicio: -1 });
        res.json(trabajos);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al obtener los trabajos' });
    }
};

// 3. Actualizar el estado de un trabajo
exports.actualizarEstadoTrabajo = async (req, res) => {
    try {
        const { estado } = req.body;
        const trabajo = await Trabajo.findById(req.params.id);

        if (!trabajo) return res.status(404).json({ error: 'Trabajo no encontrado' });

        // Si pasamos a Fabricación (o una fase posterior), comprobamos pieza por pieza
        if (estado === 'Fabricación' || estado === 'Prueba' || estado === 'Entrega') {
            
            for (let item of trabajo.materiales) {
                // Solo restamos el stock si ESTA PIEZA en concreto no se había restado antes
                if (item.descontado === false) {
                    await Producto.findByIdAndUpdate(item.producto, {
                        $inc: { stock: -item.cantidad } 
                    });
                    item.descontado = true; // Le ponemos el candado solo a esta pieza
                }
            }
        }

        trabajo.estado = estado;
        trabajo.fechaActualizacion = Date.now();
        await trabajo.save();

        res.json(trabajo);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al actualizar el estado' });
    }
};

// 4. Añadir un material (pieza) al trabajo
exports.agregarMaterial = async (req, res) => {
    try {
        const { productoId, cantidad } = req.body;
        const trabajo = await Trabajo.findById(req.params.id);
        
        let yaDescontado = false;

        // Si añades una pieza cuando el trabajo YA ESTÁ en fabricación, la resta al instante
        if (trabajo.estado === 'Fabricación' || trabajo.estado === 'Prueba' || trabajo.estado === 'Entrega') {
            await Producto.findByIdAndUpdate(productoId, {
                $inc: { stock: -cantidad }
            });
            yaDescontado = true; // Como ya la hemos restado, entra con el candado puesto
        }

        // Metemos la pieza en la lista
        trabajo.materiales.push({ 
            producto: productoId, 
            cantidad: cantidad,
            descontado: yaDescontado
        });
        
        await trabajo.save();
        res.json(trabajo);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al añadir el material' });
    }
};

// 5. Eliminar un material de un trabajo y devolver stock si hace falta
exports.eliminarMaterial = async (req, res) => {
    try {
        const { id, materialId } = req.params;
        const trabajo = await Trabajo.findById(id);

        if (!trabajo) return res.status(404).json({ error: 'Trabajo no encontrado' });

        // Buscamos la pieza exacta dentro de la lista de materiales del expediente
        const materialIndex = trabajo.materiales.findIndex(m => m._id.toString() === materialId);
        if (materialIndex === -1) return res.status(404).json({ error: 'Material no encontrado en el expediente' });

        const material = trabajo.materiales[materialIndex];

        // Si la pieza ya se había restado del almacén (porque estaba en Fabricación), se la devolvemos
        if (material.descontado === true) {
            const Producto = require('../models/Producto');
            await Producto.findByIdAndUpdate(material.producto, {
                $inc: { stock: material.cantidad } // Sumamos el stock de vuelta (+cantidad)
            });
        }

        // Eliminamos el material del expediente
        trabajo.materiales.splice(materialIndex, 1);
        
        await trabajo.save();
        res.json(trabajo);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al eliminar el material' });
    }
};
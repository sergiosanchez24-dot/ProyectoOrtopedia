import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Swal from 'sweetalert2';

function EditarProducto() {
  const navigate = useNavigate();
  const { id } = useParams(); // Sacamos el ID de la URL
  
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    stock: 0,
    precio: 0,
    descripcion: '',
    imagen: ''
  });

  useEffect(() => {
    const cargarProducto = async () => {
      try {
        const res = await axios.get(`http://172.23.16.181:5000/api/productos/${id}`);
        const producto = res.data;
        
        // Convertimos la lista de categorías de la base de datos a texto ("Cat1, Cat2")
        let categoriasTexto = '';
        if (producto.categoria) {
            categoriasTexto = Array.isArray(producto.categoria) 
                ? producto.categoria.join(', ') 
                : producto.categoria;
        }

        // Rellenamos el formulario con los datos que llegaron
        setFormData({
            nombre: producto.nombre,
            categoria: categoriasTexto,
            stock: producto.stock,
            precio: producto.precio,
            descripcion: producto.descripcion || '',
            imagen: producto.imagen || ''
        });
      } catch (error) {
        console.error(error);
        Swal.fire('Error', 'No se pudo cargar la información del artículo', 'error');
        navigate('/inventario');
      }
    };
    cargarProducto();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Volvemos a convertir el texto en lista antes de guardar
    let categoriasArray = [];
    if (formData.categoria) {
      categoriasArray = String(formData.categoria)
        .split(',')
        .map(cat => cat.trim())
        .filter(cat => cat !== '');
    }

    const datosAEnviar = { ...formData, categoria: categoriasArray };

    try {
      await axios.put(`http://172.23.16.181:5000/api/productos/${id}`, datosAEnviar);
      
      Swal.fire({
        icon: 'success',
        title: '¡Artículo actualizado!',
        showConfirmButton: false,
        timer: 1500
      });
      navigate('/inventario');
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Hubo un problema al actualizar el artículo', 'error');
    }
  };

  return (
    <div className="container-xl mt-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold">Editar Artículo</h2>
            <Link to="/inventario" className="btn btn-outline-secondary fw-bold shadow-sm">
              Volver al Inventario
            </Link>
          </div>

          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                
                <div className="row g-3 mb-3">
                  <div className="col-md-7">
                    <label className="form-label fw-semibold">Nombre del artículo *</label>
                    <input type="text" name="nombre" className="form-control" value={formData.nombre} onChange={handleChange} required />
                  </div>
                  
                  <div className="col-md-5">
                    <label className="form-label fw-semibold">Categoría/s</label>
                    <input type="text" name="categoria" className="form-control" value={formData.categoria} onChange={handleChange} />
                    <small className="text-muted" style={{ fontSize: '0.8rem' }}>Separa varias categorías con comas.</small>
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Unidades en Stock *</label>
                    <input type="number" name="stock" className="form-control" min="0" value={formData.stock} onChange={handleChange} required />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Precio de coste (€) *</label>
                    <input type="number" step="0.01" name="precio" className="form-control" value={formData.precio} onChange={handleChange} required />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">URL de la imagen (Opcional)</label>
                  <input type="url" name="imagen" className="form-control" value={formData.imagen} onChange={handleChange} />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Descripción / Detalles (Opcional)</label>
                  <textarea name="descripcion" className="form-control" rows="3" value={formData.descripcion} onChange={handleChange}></textarea>
                </div>

                <button type="submit" className="btn btn-primary w-100 py-2 fw-bold rounded-3 shadow-sm">
                  Guardar Cambios
                </button>
                
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditarProducto;
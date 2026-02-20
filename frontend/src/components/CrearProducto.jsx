import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';

function CrearProducto() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '', // Aquí guardamos temporalmente el texto "Tornillos, Prótesis"
    stock: 0,
    precio: 0,
    descripcion: '',
    imagen: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 👇 AQUÍ ESTÁ EL TRUCO PARA LAS COMAS 👇
    let categoriasArray = [];
    if (formData.categoria) {
      categoriasArray = formData.categoria
        .split(',') // Cortamos la frase por cada coma
        .map(cat => cat.trim()) // Le quitamos los espacios en blanco de los lados
        .filter(cat => cat !== ''); // Borramos las vacías por si pusiste dos comas juntas
    }

    // Cambiamos el texto plano por nuestra nueva lista de categorías
    const datosAEnviar = { ...formData, categoria: categoriasArray };

    try {
      await axios.post('http://localhost:5000/api/productos', datosAEnviar);
      
      Swal.fire({
        icon: 'success',
        title: '¡Artículo añadido!',
        showConfirmButton: false,
        timer: 1500
      });
      navigate('/inventario');
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Hubo un problema al crear el artículo', 'error');
    }
  };

  return (
    <div className="container-xl mt-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold">➕ Nuevo Artículo</h2>
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
                    <input type="text" name="nombre" className="form-control" onChange={handleChange} required />
                  </div>
                  
                  <div className="col-md-5">
                    <label className="form-label fw-semibold">Categoría/s</label>
                    {/* 👇 Fíjate en el placeholder para guiar al usuario 👇 */}
                    <input type="text" name="categoria" className="form-control" placeholder="Ej: Tornillos, Prótesis..." onChange={handleChange} />
                    <small className="text-muted" style={{ fontSize: '0.8rem' }}>Separa varias categorías con comas.</small>
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Unidades en Stock *</label>
                    <input type="number" name="stock" className="form-control" min="0" onChange={handleChange} required />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Precio de coste (€) *</label>
                    <input type="number" step="0.01" name="precio" className="form-control" placeholder="0.00" onChange={handleChange} required />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">URL de la imagen (Opcional)</label>
                  <input type="url" name="imagen" className="form-control" placeholder="https://ejemplo.com/foto.jpg" onChange={handleChange} />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Descripción / Detalles (Opcional)</label>
                  <textarea name="descripcion" className="form-control" rows="3" onChange={handleChange}></textarea>
                </div>

                <button type="submit" className="btn btn-dark w-100 py-2 fw-bold rounded-3 shadow-sm">
                  Guardar en Inventario
                </button>
                
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CrearProducto;
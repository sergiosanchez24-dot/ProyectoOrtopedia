import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import fondoLogin from '../assets/fondo.jpg';

function RegistroUsuario() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'empleado' // Por defecto será empleado
  });

  const navigate = useNavigate();

  const estiloFondo = {
    backgroundImage: `url(${fondoLogin})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    width: '100vw',
    height: '100vh'
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/usuarios/registro', formData);
      
      Swal.fire({
        title: '¡Cuenta creada!',
        text: 'El trabajador ha sido registrado correctamente.',
        icon: 'success',
        confirmButtonColor: '#212529'
      });
      
      navigate('/'); // Lo mandamos al login
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: 'Error al registrar',
        text: error.response?.data?.msg || 'Hubo un problema al crear la cuenta',
        icon: 'error'
      });
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={estiloFondo}>
      <div className="card shadow-lg p-4" style={{ width: '400px', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
        <h3 className="text-center mb-4 fw-bold">Nuevo Trabajador</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Nombre completo:</label>
            <input type="text" name="nombre" className="form-control" onChange={handleChange} required />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Email:</label>
            <input type="email" name="email" className="form-control" onChange={handleChange} required />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Contraseña:</label>
            <input type="password" name="password" className="form-control" onChange={handleChange} required />
          </div>

          {/* NUEVO DESPLEGABLE DE ROLES */}
          <div className="mb-4">
            <label className="form-label fw-semibold">Puesto en el taller:</label>
            <select name="rol" className="form-select" onChange={handleChange} value={formData.rol}>
              <option value="empleado">Técnico / Empleado</option>
              <option value="admin">Administrador (Jefe)</option>
            </select>
          </div>

          <button type="submit" className="btn btn-dark w-100 fw-bold">Registrar Cuenta</button>
        </form>

        <div className="text-center mt-3">
          <small className="text-secondary">¿Ya tienes cuenta? <Link to="/" className="text-dark fw-bold">Inicia sesión</Link></small>
        </div>
      </div>
    </div>
  );
}

export default RegistroUsuario;
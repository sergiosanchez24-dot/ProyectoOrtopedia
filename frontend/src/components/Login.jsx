import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; 
import fondoLogin from '../assets/fondo.jpg'; 

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
      const res = await axios.post('http://localhost:5000/api/usuarios/login', formData);
      
      // Guardamos el token de seguridad y el nombre del usuario en el navegador
      if (res.data.token) {
          localStorage.setItem('token', res.data.token);
      }
      localStorage.setItem('usuario', res.data.usuario.nombre);
      localStorage.setItem('rol', res.data.usuario.rol);

      // Toast pequeño arriba a la derecha (estilo notificación de móvil)
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      });

      Toast.fire({
        icon: 'success',
        title: `¡Bienvenido, ${res.data.usuario.nombre}!`
      });

      navigate('/inicio');

    } catch (error) {
      console.error(error);
      Swal.fire({
        title: 'Acceso Denegado',
        text: error.response?.data?.msg || 'Credenciales incorrectas',
        icon: 'error',
        confirmButtonText: 'Probar otra vez'
      });
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={estiloFondo}>
      <div className="card shadow-lg p-4" style={{ width: '400px', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
        <h2 className="text-center mb-4">Iniciar Sesión</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email:</label>
            <input type="email" name="email" className="form-control" onChange={handleChange} required />
          </div>

          <div className="mb-3">
            <label className="form-label">Contraseña:</label>
            <input type="password" name="password" className="form-control" onChange={handleChange} required />
          </div>

          <button type="submit" className="btn btn-primary w-100">Entrar</button>
        </form>

        <div className="text-center mt-3">
          <small>¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link></small>
        </div>
      </div>
    </div>
  );
}

export default Login;
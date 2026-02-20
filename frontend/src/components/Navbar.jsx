import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const [nombreUsuario, setNombreUsuario] = useState('');

  useEffect(() => {
    // Buscamos los datos del usuario en el almacenamiento del navegador
    const usuarioGuardado = localStorage.getItem('usuario');
    
    if (usuarioGuardado) {
      try {
        // Si lo guardaste como un objeto (con id, nombre, email...)
        const usuarioObj = JSON.parse(usuarioGuardado);
        setNombreUsuario(usuarioObj.nombre || usuarioObj.usuario || 'Usuario');
      } catch (error) {
        // Si lo guardaste simplemente como texto
        setNombreUsuario(usuarioGuardado);
      }
    }
  }, []);

  const handleCerrarSesion = () => {
    // Borramos los datos de la sesión por seguridad
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    // Redirigimos al Login
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div className="container-xl">
        <Link className="navbar-brand fw-bold" to="/inicio">
          Taller Ortopedia
        </Link>
        
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/inicio">Inicio</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/pacientes">Pacientes</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/inventario">Inventario</Link>
            </li>
          </ul>
          
          {/* AQUÍ ESTÁ LA MAGIA: Contenedor alineado a la derecha */}
          <div className="d-flex align-items-center gap-3 mt-2 mt-lg-0">
            <span className="text-light opacity-75 fw-semibold m-0">
              {nombreUsuario || 'Usuario'}
            </span>
            <button className="btn btn-outline-light btn-sm fw-bold" onClick={handleCerrarSesion}>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
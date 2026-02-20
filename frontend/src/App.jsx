import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

// Importamos todos los componentes
import Navbar from './components/Navbar';
import Login from './components/Login';
import RegistroUsuario from './components/RegistroUsuario';
import Home from './components/Home';                 // <--- El nuevo Panel de Control (Dashboard)
import Inventario from './components/Inventario';     // <--- El listado visual de piezas
import CrearProducto from './components/CrearProducto'; 
import Pacientes from './components/Pacientes'; 
import FichaPaciente from './components/FichaPaciente'; 
import EditarProducto from './components/EditarProducto';

function Content() {
  const location = useLocation();

  // Ocultar Navbar solo en Login (/) y Registro (/registro)
  const rutasSinNavbar = ['/', '/registro'];
  const mostrarNavbar = !rutasSinNavbar.includes(location.pathname);

  return (
    <>
      {mostrarNavbar && <Navbar />}

      <div className={mostrarNavbar ? "container mt-4" : ""}>
        <Routes>
          {/* Rutas de Acceso */}
          <Route path="/" element={<Login />} />
          <Route path="/registro" element={<RegistroUsuario />} />

          {/* Rutas de la Aplicación (Taller) */}
          <Route path="/inicio" element={<Home />} />                 {/* Panel de Control Principal */}
          
          {/* Área de Pacientes */}
          <Route path="/pacientes" element={<Pacientes />} />         {/* Lista de pacientes */}
          <Route path="/pacientes/:id" element={<FichaPaciente />} /> {/* Ficha y Trabajos del paciente */}
          
          {/* Área de Inventario */}
          <Route path="/inventario" element={<Inventario />} />       {/* Ver todo el stock */}
          <Route path="/crear-producto" element={<CrearProducto />} />{/* Añadir nueva pieza al almacén */}
          <Route path="/editar-producto/:id" element={<EditarProducto />} /> {/* Editar pieza existente */}
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Content />
    </BrowserRouter>
  );
}

export default App;
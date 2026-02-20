import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Home() {
  const [estadisticas, setEstadisticas] = useState({
    totalPacientes: 0,
    totalProductos: 0,
    productosBajoStock: []
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatosDashboard = async () => {
      try {
        // Pedimos los datos al backend al mismo tiempo
        const [resPacientes, resProductos] = await Promise.all([
          axios.get('http://localhost:5000/api/pacientes'),
          axios.get('http://localhost:5000/api/productos')
        ]);

        // Filtramos qué productos tienen 5 o menos unidades
        const bajoStock = resProductos.data.filter(p => p.stock <= 5);

        setEstadisticas({
          totalPacientes: resPacientes.data.length,
          totalProductos: resProductos.data.length,
          productosBajoStock: bajoStock
        });
        setCargando(false);
      } catch (error) {
        console.error("Error al cargar el panel de control:", error);
        setCargando(false);
      }
    };

    cargarDatosDashboard();
  }, []);

  if (cargando) return <div className="text-center mt-5">Cargando panel de control...</div>;

  return (
    <div className="container-xl mt-5 mb-5">
      
      {/* Cabecera del Dashboard */}
      <div className="d-flex justify-content-between align-items-center border-bottom border-dark border-2 pb-3 mb-4">
        <div>
          <h2 className="fw-bold mb-0">Bienvenido al Taller</h2>
          <span className="text-secondary">Resumen de actividad y alertas</span>
        </div>
        <div className="d-flex gap-2">
          <Link to="/pacientes" className="btn btn-dark shadow-sm">+ Nuevo Paciente</Link>
          <Link to="/inventario" className="btn btn-outline-dark shadow-sm">Ver Inventario</Link>
        </div>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="row mb-5">
        <div className="col-md-4 mb-3">
          <div className="card border-dark shadow-sm h-100 p-4 text-center">
            <h6 className="text-secondary text-uppercase fw-bold mb-3">Pacientes Registrados</h6>
            <h2 className="display-4 fw-bold mb-0">{estadisticas.totalPacientes}</h2>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card border-dark shadow-sm h-100 p-4 text-center">
            <h6 className="text-secondary text-uppercase fw-bold mb-3">Artículos en Catálogo</h6>
            <h2 className="display-4 fw-bold mb-0">{estadisticas.totalProductos}</h2>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className={`card shadow-sm h-100 p-4 text-center ${estadisticas.productosBajoStock.length > 0 ? 'border-danger' : 'border-success'}`}>
            <h6 className="text-secondary text-uppercase fw-bold mb-3">Alertas de Stock (≤ 5)</h6>
            <h2 className={`display-4 fw-bold mb-0 ${estadisticas.productosBajoStock.length > 0 ? 'text-danger' : 'text-success'}`}>
              {estadisticas.productosBajoStock.length}
            </h2>
          </div>
        </div>
      </div>

      {/* Sección de Alertas de Inventario */}
      {estadisticas.productosBajoStock.length > 0 && (
        <div className="card border-danger shadow-sm">
          <div className="card-header bg-danger text-white fw-bold">
            ⚠️ Atención: Productos que necesitan reposición
          </div>
          <ul className="list-group list-group-flush">
            {estadisticas.productosBajoStock.map(prod => (
              <li key={prod._id} className="list-group-item d-flex justify-content-between align-items-center py-3">
                <div>
                  <span className="fw-bold d-block">{prod.nombre}</span>
                  <span className="small text-secondary">{prod.descripcion}</span>
                </div>
                <div className="text-end">
                  <span className="badge bg-danger rounded-pill fs-6 px-3 py-2">Solo {prod.stock} uds.</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {estadisticas.productosBajoStock.length === 0 && (
        <div className="text-center p-5 border border-success rounded bg-light">
          <h4 className="text-success fw-bold mb-0">¡Todo en orden! ✅</h4>
          <p className="text-secondary mt-2 mb-0">No hay ningún producto con stock bajo en este momento.</p>
        </div>
      )}

    </div>
  );
}

export default Home;
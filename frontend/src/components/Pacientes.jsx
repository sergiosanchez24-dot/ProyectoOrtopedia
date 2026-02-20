import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';

function Pacientes() {
  const [pacientes, setPacientes] = useState([]);
  const rolUsuario = localStorage.getItem('rol');
  const [nuevoPaciente, setNuevoPaciente] = useState({ nombre: '', telefono: '', dni: '', edad: '' });

  useEffect(() => {
    cargarPacientes();
  }, []);

  const cargarPacientes = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/pacientes');
      setPacientes(res.data);
    } catch (error) {
      console.error("Error cargando pacientes:", error);
    }
  };

  const handleChange = (e) => {
    setNuevoPaciente({ ...nuevoPaciente, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        await axios.post('http://localhost:5000/api/pacientes', nuevoPaciente);
        Swal.fire({
          icon: 'success',
          title: 'Paciente registrado',
          showConfirmButton: false,
          timer: 1500
        });
        setNuevoPaciente({ nombre: '', telefono: '', dni: '', edad: '' }); // Limpiar form
        cargarPacientes(); // Recargar lista
    } catch (error) {
        Swal.fire('Error', 'No se pudo guardar el paciente', 'error');
    }
  };

  // 👇 NUEVA FUNCIÓN PARA ELIMINAR PACIENTE 👇
  const handleEliminarPaciente = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Se borrará la ficha de este paciente y todo su historial de forma permanente.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:5000/api/pacientes/${id}`);
        // Quitamos al paciente de la lista visualmente sin tener que recargar la página
        setPacientes(pacientes.filter(paciente => paciente._id !== id));
        
        Swal.fire('¡Eliminado!', 'El paciente ha sido borrado.', 'success');
      } catch (error) {
        console.error("Error al eliminar:", error);
        Swal.fire('Error', 'No se pudo eliminar el paciente.', 'error');
      }
    }
  };

  return (
    <div className="container-xl mt-4">
      {/* Encabezado de la página */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark">👥 Gestión de Pacientes</h2>
        <span className="badge bg-primary fs-6 px-3 py-2 rounded-pill shadow-sm">
          Total: {pacientes.length}
        </span>
      </div>

      <div className="row">
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <div className="col-lg-4 mb-4">
            <div className="card shadow-sm border-0 rounded-4">
                <div className="card-header bg-white border-bottom-0 pt-4 pb-2">
                    <h5 className="fw-bold mb-0 text-primary">➕ Nuevo Registro</h5>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        
                        {/* Inputs con estilo moderno (Floating Labels) */}
                        <div className="form-floating mb-3">
                            <input type="text" id="nombre" name="nombre" className="form-control" placeholder="Nombre Completo" value={nuevoPaciente.nombre} onChange={handleChange} required />
                            <label htmlFor="nombre">Nombre Completo</label>
                        </div>
                        
                        <div className="form-floating mb-3">
                            <input type="text" id="telefono" name="telefono" className="form-control" placeholder="Teléfono" value={nuevoPaciente.telefono} onChange={handleChange} required />
                            <label htmlFor="telefono">Teléfono de contacto</label>
                        </div>
                        
                        <div className="row g-2">
                          <div className="col-md-8">
                            <div className="form-floating mb-3">
                                <input type="text" id="dni" name="dni" className="form-control" placeholder="DNI / NIF" value={nuevoPaciente.dni} onChange={handleChange} />
                                <label htmlFor="dni">DNI / NIF</label>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="form-floating mb-4">
                                <input type="number" id="edad" name="edad" className="form-control" placeholder="Edad" value={nuevoPaciente.edad} onChange={handleChange} />
                                <label htmlFor="edad">Edad</label>
                            </div>
                          </div>
                        </div>

                        <div className="form-floating mb-4">
                            <textarea id="diagnostico" name="diagnostico" className="form-control" placeholder="Motivo de la consulta..." style={{ height: '100px' }} value={nuevoPaciente.diagnostico || ''} onChange={handleChange}></textarea>
                            <label htmlFor="diagnostico">Motivo de consulta / Diagnóstico</label>
                        </div>

                        <button type="submit" className="btn btn-primary w-100 py-2 fw-bold rounded-3 shadow-sm">
                          Guardar Paciente
                        </button>
                    </form>
                </div>
            </div>
        </div>

        {/* COLUMNA DERECHA: TABLA DE PACIENTES */}
        <div className="col-lg-8">
            <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                <div className="card-body p-0">
                    {pacientes.length === 0 ? (
                        /* ESTADO VACÍO */
                        <div className="text-center p-5 text-muted">
                            <div className="display-1 mb-3">📇</div>
                            <h4>No hay pacientes registrados</h4>
                            <p>Utiliza el formulario de la izquierda para dar de alta a tu primer paciente en el sistema.</p>
                        </div>
                    ) : (
                        /* TABLA DE DATOS PROFESIONAL */
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light text-secondary">
                                    <tr>
                                        <th className="py-3 px-4 fw-semibold border-0">Paciente</th>
                                        <th className="py-3 px-4 fw-semibold border-0">Contacto</th>
                                        <th className="py-3 px-4 fw-semibold border-0">DNI</th>
                                        <th className="py-3 text-center fw-semibold border-0">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pacientes.map(p => (
                                        <tr key={p._id}>
                                            <td className="py-3 px-4">
                                                <div className="d-flex align-items-center">
                                                    <div className="bg-light text-primary rounded-circle d-flex justify-content-center align-items-center fw-bold me-3" style={{ width: '40px', height: '40px' }}>
                                                        {p.nombre.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <span className="fw-bold text-dark d-block">{p.nombre}</span>
                                                        <span className="text-muted small">{p.edad ? `${p.edad} años` : 'Edad no espec.'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">📞 {p.telefono}</td>
                                            <td className="py-3 px-4 text-muted">{p.dni || '---'}</td>
                                            <td className="py-3 text-center">
                                                {/* CONTENEDOR DE BOTONES */}
                                                <div className="d-flex justify-content-center gap-2">
                                                  <Link to={`/pacientes/${p._id}`} className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-semibold">
                                                      Ver Ficha
                                                  </Link>
                                                  
                                                  {/* BOTÓN DE ADMINISTRADOR */}
                                                  {rolUsuario === 'admin' && (
                                                    <button 
                                                      className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-semibold"
                                                      onClick={() => handleEliminarPaciente(p._id)}
                                                    >
                                                      Borrar
                                                    </button>
                                                  )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default Pacientes;
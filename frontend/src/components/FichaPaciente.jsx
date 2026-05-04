import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import Swal from 'sweetalert2';

function FichaPaciente() {
  const { id } = useParams();
  const [paciente, setPaciente] = useState(null);
  const [trabajos, setTrabajos] = useState([]);
  const [productos, setProductos] = useState([]);
  
  const [nuevoTrabajo, setNuevoTrabajo] = useState({ titulo: '', descripcion: '' });
  
  // Estado para controlar los formularios de añadir material de cada trabajo
  const [formMateriales, setFormMateriales] = useState({});

  const estadosPosibles = ['Valoración', 'Presupuesto', 'Fabricación', 'Prueba', 'Entrega'];

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      const resPaciente = await axios.get(`http://172.23.16.181:5000/api/pacientes/${id}`);
      setPaciente(resPaciente.data);

      const resTrabajos = await axios.get(`http://172.23.16.181:5000/api/trabajos/paciente/${id}`);
      setTrabajos(resTrabajos.data);

      const resProductos = await axios.get('http://172.23.16.181:5000/api/productos');
      setProductos(resProductos.data);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    }
  };

  const handleCrearTrabajo = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://172.23.16.181:5000/api/trabajos', { ...nuevoTrabajo, paciente: id });
      setNuevoTrabajo({ titulo: '', descripcion: '' });
      cargarDatos();
    } catch (error) {
      console.error("Error al crear trabajo:", error);
    }
  };

  const handleCambiarEstado = async (trabajoId, nuevoEstado) => {
    try {
      await axios.put(`http://172.23.16.181:5000/api/trabajos/${trabajoId}/estado`, { estado: nuevoEstado });
      cargarDatos();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
  };

  // 👇 AQUÍ ESTÁ EL CANDADO ANTI-NÚMEROS NEGATIVOS 👇
  const handleAñadirMaterial = async (trabajoId) => {
    const datosForm = formMateriales[trabajoId];
    if (!datosForm || !datosForm.productoId) return; 

    const cantidadDeseada = parseInt(datosForm.cantidad) || 1;

    // 1. Buscamos el producto en nuestro almacén local
    const productoSeleccionado = productos.find(p => p._id === datosForm.productoId);

    // 2. Comprobamos si hay suficiente stock
    if (productoSeleccionado && productoSeleccionado.stock < cantidadDeseada) {
        Swal.fire({
            icon: 'error',
            title: 'Stock Insuficiente',
            text: `Solo quedan ${productoSeleccionado.stock} unidades de "${productoSeleccionado.nombre}". No puedes añadir ${cantidadDeseada}.`
        });
        return; // Detenemos la función aquí mismo
    }

    // 3. Si hay stock, procedemos normalmente
    try {
      await axios.post(`http://172.23.16.181:5000/api/trabajos/${trabajoId}/materiales`, {
        productoId: datosForm.productoId,
        cantidad: cantidadDeseada
      });
      
      setFormMateriales({ ...formMateriales, [trabajoId]: { productoId: '', cantidad: 1 } });
      cargarDatos(); 
    } catch (error) {
      console.error("Error al añadir material:", error);
    }
  };

  const handleEliminarMaterial = async (trabajoId, materialId) => {
    const result = await Swal.fire({
      title: '¿Retirar pieza?',
      text: "Se eliminará del presupuesto y el stock volverá al almacén.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#212529',
      cancelButtonColor: '#dc3545',
      confirmButtonText: 'Sí, retirar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://172.23.16.181:5000/api/trabajos/${trabajoId}/materiales/${materialId}`);
        cargarDatos(); 
        
        Swal.fire({
          title: '¡Retirado!',
          text: 'El stock ha sido devuelto al inventario.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error) {
        console.error("Error al eliminar material:", error);
        Swal.fire('Error', 'Hubo un problema al retirar la pieza.', 'error');
      }
    }
  };

  const handleFormMaterialChange = (trabajoId, campo, valor) => {
    setFormMateriales({
      ...formMateriales,
      [trabajoId]: {
        ...formMateriales[trabajoId],
        [campo]: valor
      }
    });
  };

  const generarPDF = () => {
    const elementosNoImprimibles = document.querySelectorAll('.no-imprimir');
    elementosNoImprimibles.forEach(el => el.style.display = 'none');

    const elemento = document.getElementById('ficha-imprimible');
    const opciones = {
      margin: 15,
      filename: `Ficha_${paciente.nombre.replace(/ /g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opciones).from(elemento).save().then(() => {
        elementosNoImprimibles.forEach(el => el.style.display = '');
    });
  };

  if (!paciente) return <div className="text-center mt-5">Cargando ficha...</div>;

  return (
    <div className="container-xl mt-4 mb-5">
      <div className="d-flex justify-content-between mb-4">
        <Link to="/pacientes" className="btn btn-outline-dark shadow-sm">Volver a Pacientes</Link>
        <button onClick={generarPDF} className="btn btn-dark shadow-sm">Descargar PDF</button>
      </div>

      <div className="row">
        <div className="col-md-4 mb-4 no-imprimir">
            <div className="card shadow-sm border-0 bg-light p-3 rounded-4 position-sticky" style={{ top: '20px' }}>
                <h5 className="fw-bold text-dark mb-3">Nueva Orden</h5>
                <form onSubmit={handleCrearTrabajo}>
                    <div className="mb-3">
                        <label className="form-label small fw-bold text-secondary">Título del Trabajo</label>
                        <input type="text" className="form-control" placeholder="Ej: Prótesis Tibial Izq." value={nuevoTrabajo.titulo} onChange={(e) => setNuevoTrabajo({...nuevoTrabajo, titulo: e.target.value})} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label small fw-bold text-secondary">Descripción</label>
                        <textarea className="form-control" rows="4" value={nuevoTrabajo.descripcion} onChange={(e) => setNuevoTrabajo({...nuevoTrabajo, descripcion: e.target.value})}></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary w-100 fw-bold">Abrir Expediente</button>
                </form>
            </div>
        </div>

        <div className="col-md-8">
            <div id="ficha-imprimible" className="card border rounded-0 p-5 bg-white text-dark" style={{ minHeight: '800px' }}>
                
                <div className="d-flex justify-content-between align-items-end border-bottom border-2 border-dark pb-3 mb-5">
                    <div>
                        <h1 className="fw-bold text-uppercase mb-0 fs-3">Taller de Ortopedia</h1>
                        <span className="text-secondary fs-6">Documento Clínico del Paciente</span>
                    </div>
                    <div className="text-end">
                        <span className="text-secondary d-block small text-uppercase">Fecha de Registro</span>
                        <strong className="fs-5">{new Date(paciente.fechaAlta).toLocaleDateString()}</strong>
                    </div>
                </div>

                <div className="row mb-5">
                    <div className="col-md-6 mb-3">
                        <span className="text-secondary text-uppercase small fw-bold">Paciente</span>
                        <p className="fs-5 mb-0 fw-bold">{paciente.nombre}</p>
                        <p className="mb-0 text-secondary">{paciente.dni || 'Sin DNI'} | 📞 {paciente.telefono}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                        <span className="text-secondary text-uppercase small fw-bold">Diagnóstico</span>
                        <p className="mb-0 border border-secondary p-2" style={{ backgroundColor: '#fdfdfd', minHeight: '60px' }}>
                            {paciente.diagnostico || <span className="text-secondary fst-italic">Sin especificar.</span>}
                        </p>
                    </div>
                </div>

                <h5 className="text-uppercase fw-bold text-dark border-bottom pb-2 mb-4">Órdenes de Taller Activas</h5>
                
                {trabajos.length === 0 ? (
                    <div className="text-center py-4 border border-dashed border-secondary">
                        <span className="text-secondary">No hay órdenes de fabricación registradas.</span>
                    </div>
                ) : (
                    <div>
                        {trabajos.map(trabajo => {
                            const costeTotal = trabajo.materiales?.reduce((total, mat) => {
                                return total + (mat.producto?.precio * mat.cantidad || 0);
                            }, 0) || 0;

                            return (
                            <div key={trabajo._id} className="border border-dark mb-5 p-4">
                                
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        <h6 className="fw-bold fs-4 mb-1 text-uppercase">{trabajo.titulo}</h6>
                                        <p className="text-secondary small mb-0">Abierto: {new Date(trabajo.fechaInicio).toLocaleDateString()}</p>
                                    </div>
                                    
                                    <select 
                                        className="form-select form-select-sm w-auto border-dark fw-bold no-imprimir bg-light" 
                                        value={trabajo.estado} 
                                        onChange={(e) => handleCambiarEstado(trabajo._id, e.target.value)}
                                    >
                                        {estadosPosibles.map(est => <option key={est} value={est}>{est}</option>)}
                                    </select>
                                </div>
                                
                                {trabajo.descripcion && (
                                    <p className="mb-4 border-start border-3 border-dark ps-3 text-secondary fst-italic">
                                        {trabajo.descripcion}
                                    </p>
                                )}

                                <div className="mt-4">
                                    <h6 className="fw-bold text-uppercase border-bottom border-secondary pb-1 mb-3">Presupuesto / Materiales</h6>
                                    
                                    {trabajo.materiales?.length > 0 && (
                                        <table className="table table-sm table-bordered border-secondary mb-3">
                                            <thead className="table-light text-secondary small text-uppercase">
                                                <tr>
                                                    <th>Pieza / Artículo</th>
                                                    <th className="text-center" style={{ width: '80px' }}>Cant.</th>
                                                    <th className="text-end" style={{ width: '100px' }}>Precio Ud.</th>
                                                    <th className="text-end" style={{ width: '100px' }}>Subtotal</th>
                                                    <th className="text-center no-imprimir" style={{ width: '40px' }}></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {trabajo.materiales.map((mat) => (
                                                    <tr key={mat._id}>
                                                        <td>{mat.producto?.nombre || 'Pieza eliminada del sistema'}</td>
                                                        <td className="text-center">{mat.cantidad}</td>
                                                        <td className="text-end">{mat.producto?.precio || 0}€</td>
                                                        <td className="text-end fw-bold">{(mat.producto?.precio * mat.cantidad || 0).toFixed(2)}€</td>
                                                        <td className="text-center no-imprimir">
                                                            <button 
                                                                className="btn btn-sm btn-outline-danger border-0 py-0" 
                                                                title="Eliminar pieza"
                                                                onClick={() => handleEliminarMaterial(trabajo._id, mat._id)}
                                                            >
                                                                🗑️
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                <tr>
                                                    <td colSpan="3" className="text-end fw-bold text-uppercase pt-3">Total Presupuesto:</td>
                                                    <td className="text-end fw-bold fs-5 pt-3">{costeTotal.toFixed(2)}€</td>
                                                    <td className="no-imprimir"></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    )}

                                    <div className="d-flex gap-2 no-imprimir bg-light p-2 border border-secondary rounded-1 align-items-center mt-3">
                                        <span className="small fw-bold text-secondary text-uppercase ms-2">Añadir pieza:</span>
                                        <select 
                                            className="form-select form-select-sm" 
                                            value={formMateriales[trabajo._id]?.productoId || ''}
                                            onChange={(e) => handleFormMaterialChange(trabajo._id, 'productoId', e.target.value)}
                                        >
                                            <option value="">-- Seleccionar del Inventario --</option>
                                            {productos.map(p => (
                                                <option key={p._id} value={p._id}>{p.nombre} ({p.precio}€)</option>
                                            ))}
                                        </select>
                                        <input 
                                            type="number" 
                                            className="form-control form-control-sm" 
                                            style={{ width: '80px' }} 
                                            min="1" 
                                            placeholder="Cant."
                                            value={formMateriales[trabajo._id]?.cantidad || 1}
                                            onChange={(e) => handleFormMaterialChange(trabajo._id, 'cantidad', e.target.value)}
                                        />
                                        <button 
                                            className="btn btn-sm btn-dark fw-bold"
                                            onClick={() => handleAñadirMaterial(trabajo._id)}
                                        >
                                            ➕
                                        </button>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between text-center small fw-bold mt-5 pt-3 border-top border-2 border-dark">
                                    {estadosPosibles.map((paso, index) => {
                                        const currentIndex = estadosPosibles.indexOf(trabajo.estado);
                                        const isCompleted = index <= currentIndex;
                                        return (
                                            <div key={paso} style={{ flex: 1, color: isCompleted ? '#000' : '#aaa' }}>
                                                <div className="fs-4">{isCompleted ? '☑' : '☐'}</div>
                                                <div style={{ fontSize: '0.70rem' }} className="text-uppercase">{paso}</div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )})}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}

export default FichaPaciente;
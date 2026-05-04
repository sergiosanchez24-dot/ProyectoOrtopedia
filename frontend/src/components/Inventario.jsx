import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2'; 

function Inventario() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState(''); 
  const [categoriaFiltro, setCategoriaFiltro] = useState(''); 
  const rolUsuario = localStorage.getItem('rol');

  // 1. OBTENER LOS PRODUCTOS
  useEffect(() => {
    const obtenerProductos = async () => {
      try {
        const res = await axios.get('http://172.23.16.181:5000/api/productos');
        setProductos(res.data);
      } catch (error) {
        console.error("Error al obtener productos", error);
      }
    };
    obtenerProductos();
  }, []);

  // 2. EXTRAER CATEGORÍAS ÚNICAS (A prueba de fallos)
  const categoriasUnicas = [...new Set(productos.flatMap(p => {
    if (!p.categoria) return [];
    return Array.isArray(p.categoria) ? p.categoria : [p.categoria];
  }))];

  // 3. FILTRADO (Búsqueda + Categoría)
  const productosFiltrados = productos.filter((p) => {
    const coincideTexto = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    
    let listaCategorias = [];
    if (p.categoria) {
        listaCategorias = Array.isArray(p.categoria) ? p.categoria : [p.categoria];
    }
    
    const coincideCategoria = categoriaFiltro === '' || listaCategorias.includes(categoriaFiltro);
    
    return coincideTexto && coincideCategoria;
  });

  // 4. MOSTRAR DETALLES AL PINCHAR EL NOMBRE
  const mostrarDetalles = (producto) => {
    let listaCat = [];
    if (producto.categoria) {
        listaCat = Array.isArray(producto.categoria) ? producto.categoria : [producto.categoria];
    }

    let categoriasHTML = listaCat.length > 0 
        ? listaCat.map(c => `<span class="badge bg-secondary me-1 mb-2">${c}</span>`).join('')
        : `<span class="badge bg-secondary mb-2">Sin categoría</span>`;

    Swal.fire({
      title: producto.nombre,
      html: `
        <div class="text-start mt-3">
            ${categoriasHTML}
            <p class="text-muted mt-2">${producto.descripcion || '<i>No hay descripción disponible para este artículo.</i>'}</p>
        </div>
      `,
      imageUrl: producto.imagen || 'https://via.placeholder.com/400x300?text=Sin+Imagen',
      imageWidth: 400,
      imageHeight: 300,
      imageAlt: 'Imagen del producto',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#212529',
      customClass: { popup: 'rounded-4 shadow-lg' }
    });
  };

  // 5. BORRAR PRODUCTO
  const borrarProducto = async (id) => {
    const confirmacion = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#212529',
      confirmButtonText: 'Sí, borrar artículo',
      cancelButtonText: 'Cancelar'
    });

    if (confirmacion.isConfirmed) {
      try {
        await axios.delete(`http://172.23.16.181:5000/api/productos/${id}`);
        
        // Actualizamos el estado para que desaparezca de la tabla sin recargar
        setProductos(productos.filter(producto => producto._id !== id));
        
        Swal.fire('¡Borrado!', 'El artículo ha sido eliminado del inventario.', 'success');
      } catch (error) {
        console.error("Error al borrar:", error);
        Swal.fire('Error', 'No se pudo borrar el artículo.', 'error');
      }
    }
  };

  return (
    <div className="container-xl mt-4">
      <div className="d-flex justify-content-between align-items-center border-bottom border-dark border-2 pb-3 mb-4">
        <h2 className="fw-bold mb-0">📦 Inventario del Taller</h2>
        
        {rolUsuario === 'admin' && (
          <Link to="/crear-producto" className="btn btn-dark shadow-sm fw-bold">
            + Añadir Nuevo Artículo
          </Link>
        )}
      </div>

      <div className="row g-3 mb-4">
        {/* BUSCADOR */}
        <div className="col-md-8">
          <div className="input-group shadow-sm h-100">
            <span className="input-group-text bg-white border-end-0">🔎</span>
            <input
              type="text"
              className="form-control border-start-0 ps-0"
              placeholder="Buscar por nombre de artículo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {/* FILTRO CATEGORÍAS */}
        <div className="col-md-4">
            <select 
                className="form-select shadow-sm h-100" 
                value={categoriaFiltro} 
                onChange={(e) => setCategoriaFiltro(e.target.value)}
            >
                <option value="">🏷️ Todas las categorías</option>
                {categoriasUnicas.map((cat, index) => (
                    <option key={index} value={cat}>{cat}</option>
                ))}
            </select>
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle bg-white mb-0">
            <thead className="table-light text-secondary">
              <tr>
                <th className="py-3 px-4 fw-semibold border-0">Artículo</th>
                <th className="py-3 px-4 fw-semibold border-0">Categoría</th>
                <th className="py-3 px-4 fw-semibold border-0">Stock</th>
                <th className="py-3 px-4 fw-semibold border-0">Precio</th>
                {rolUsuario === 'admin' && <th className="py-3 text-center fw-semibold border-0">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.length > 0 ? (
                productosFiltrados.map((p) => (
                  <tr key={p._id}>
                    
                    {/* NOMBRE Clicable */}
                    <td className="py-3 px-4">
                        <span 
                            className="fw-bold text-primary d-inline-block" 
                            style={{ cursor: 'pointer', borderBottom: '1px dashed #0d6efd' }}
                            onClick={() => mostrarDetalles(p)}
                            title="Ver imagen y descripción"
                        >
                            {p.nombre}
                        </span>
                    </td>

                    {/* CATEGORÍAS */}
                    <td className="py-3 px-4">
                        {(() => {
                            let listaCategorias = [];
                            if (p.categoria) {
                                listaCategorias = Array.isArray(p.categoria) ? p.categoria : [p.categoria];
                            }
                            return listaCategorias.length > 0 && listaCategorias[0] ? (
                                <div className="d-flex flex-wrap gap-1">
                                    {listaCategorias.map((cat, index) => (
                                        <span key={index} className="badge bg-light text-dark border px-2 py-1">
                                            {cat}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <span className="text-muted small">Sin categoría</span>
                            );
                        })()}
                    </td>

                    {/* STOCK */}
                    <td className="py-3 px-4">
                      <span className={`fw-bold px-2 py-1 rounded ${p.stock < 5 ? 'bg-danger text-white' : 'text-success'}`}>
                        {p.stock} ud.
                      </span>
                    </td>

                    {/* PRECIO */}
                    <td className="py-3 px-4 text-muted">{p.precio}€</td>
                    
                    {/* ACCIONES: EDITAR Y BORRAR */}
                    {rolUsuario === 'admin' && (
                      <td className="py-3 text-center">
                        <div className="d-flex justify-content-center gap-2">
                            <Link 
                                to={`/editar-producto/${p._id}`} 
                                className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-semibold"
                            >
                                Editar
                            </Link>
                            
                            <button 
                                onClick={() => borrarProducto(p._id)}
                                className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-semibold"
                            >
                                Borrar
                            </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    <div className="display-4 mb-3">📭</div>
                    <h5>No se encontraron artículos</h5>
                    <p>Prueba con otra búsqueda o categoría.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Inventario;
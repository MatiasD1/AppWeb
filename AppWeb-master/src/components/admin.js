import React, { useState, useEffect } from "react";
import {  db } from "../firebaseConfig";
import NavBar from "./navBar";
import { 
  collection,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  onSnapshot
} from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import Loading from "./Loading";
import Swal from "sweetalert2";
import { HandleChangeFecha } from "./handleChangeFecha";

const Admin = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage,setSelectedImage] = useState(null);
  const [solicitudes, setSolicitudes] = useState({});
  const [filtros, setFiltros] = useState({
    localidad: '',
    estado: '',
    nombre: '',
    rol: '',
  });
  
  const navigate = useNavigate();

  const handelImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  }

  const closeImageModal = () =>{
    setSelectedImage(null);
  }

  const safeFormatDate = (dateValue) => {
    // Si el valor es null/undefined, retornar string vacío
    if (!dateValue) return "";
    
    try {
      // Convertir a Date object si es necesario
      const dateObj = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
      
      // Verificar si la fecha es válida
      if (isNaN(dateObj.getTime())) return "";
      
      // Formatear a YYYY-MM-DD (formato que espera input type="date")
      return dateObj.toISOString().split("T")[0];
    } catch (error) {
      console.error("Error formateando fecha:", error);
      return "";
    }
  };

  useEffect(() => {
    
    const calcularEstado = async (fechaInicio, fechaVencimiento, estadoActual, userId) => {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
    
      // Obtener estado de solicitud
      const solicitudRef = doc(db, "solicitudes", userId);
      const solicitudSnap = await getDoc(solicitudRef);
      setSolicitudes(prev => ({ ...prev, [userId]: solicitudSnap.exists() ? solicitudSnap.data() : null }));
    
      // Si ya está inactivo, mantener valores null
      if (estadoActual === "inactivo") {
        return { estado: "inactivo", fechaInicio: null, fechaVencimiento: null };
      }
    
      // Si tiene fechas válidas
      if (fechaInicio && fechaVencimiento) {
        const inicioDate = fechaInicio.toDate ? fechaInicio.toDate() : new Date(fechaInicio);
        const vencimientoDate = fechaVencimiento.toDate ? fechaVencimiento.toDate() : new Date(fechaVencimiento);
    
        // Normalizar fechas para comparación
        inicioDate.setHours(0, 0, 0, 0);
        vencimientoDate.setHours(0, 0, 0, 0);
    
        // Estado activo solo si hoy está estrictamente dentro del rango
        if (hoy >= inicioDate && hoy < vencimientoDate) {
          return { estado: "activo", fechaInicio, fechaVencimiento };
        }
    
        // Si hoy es posterior a la fecha de vencimiento
        if (hoy > vencimientoDate) {
          console.log(`Usuario ${userId} ha expirado (${vencimientoDate})`);
          const resultado = await manejarExpiracion(userId);
          return resultado || { estado: "inactivo", fechaInicio: null, fechaVencimiento: null };
        }
      }
    
      // Estado por defecto
      return { estado: "pendiente", fechaInicio, fechaVencimiento };
    };
      
    
    const manejarExpiracion = async (userId) => {
      console.log(`Procesando expiración para usuario: ${userId}`);
      
      try {
        // Verificar y eliminar solicitud
        const solicitudRef = doc(db, "solicitudes", userId);
        const solicitudSnap = await getDoc(solicitudRef);
        
        if (solicitudSnap.exists()) {
          await deleteDoc(solicitudRef);
          console.log(`Solicitud eliminada para ${userId}`);
        }
    
        // Actualizar usuario con valores null
        const usuarioRef = doc(db, "usuarios", userId);
        await updateDoc(usuarioRef, {
          fechaDeInicio: null,
          fechaDeVencimiento: null,
          estado: "inactivo"
        });
    
        // Verificar la actualización
        const usuarioActualizado = await getDoc(usuarioRef);
        const usuarioData = usuarioActualizado.data();
        
        if (usuarioData.estado !== "inactivo" || 
            usuarioData.fechaDeInicio !== null || 
            usuarioData.fechaDeVencimiento !== null) {
          throw new Error("La actualización no se aplicó correctamente");
        }
    
        console.log(`Usuario ${userId} actualizado correctamente`);
    
        // Retornar el nuevo estado
        return {
          id: userId,
          fechaDeInicio: null,
          fechaDeVencimiento: null,
          estado: "inactivo"
        };
    
      } catch (error) {
        console.error(`Error en manejarExpiracion: ${error.message}`);
        // Recargar datos desde Firestore como fallback
        const usuarioRef = doc(db, "usuarios", userId);
        const usuarioSnap = await getDoc(usuarioRef);
        return usuarioSnap.exists() ? usuarioSnap.data() : null;
      }
    };
    
    setLoading(true);
    const usuariosRef = collection(db, "usuarios");
    
    const unsubscribe = onSnapshot(usuariosRef, async (snapshot) => {
      const usuariosData = await Promise.all(
        snapshot.docs.map(async (usuarioDoc) => {
          const data = usuarioDoc.data();
          const estadoActual = data.estado;
          const fechaInicio = data.fechaDeInicio?.toDate() || null;
          const fechaVencimiento = data.fechaDeVencimiento?.toDate() || null;
          
          const { estado, fechaInicio: newFechaInicio, fechaVencimiento: newFechaVencimiento } = 
            await calcularEstado(fechaInicio, fechaVencimiento, estadoActual, usuarioDoc.id);
    
          return {
            id: usuarioDoc.id,
            ...data,
            estado:estado,
            fechaDeInicio: newFechaInicio,
            fechaDeVencimiento: newFechaVencimiento
          };
        })
      );
      setUsuarios(usuariosData);
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, []);

  const ManejarBaja = async (id) => {
    
    const confirmed = await Swal.fire({
          title: "¿Eliminar usuario?",
          text: "Esta acción no se puede deshacer.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Sí, eliminar",
          cancelButtonText: "Cancelar",
        });
    if (!confirmed.isConfirmed) return;
    Swal.fire({
          title: "Eliminando usuario...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

    try {
        await deleteDoc(doc(db, "usuarios", id));
        setUsuarios(usuarios.filter((user) => user.id !== id));
        Swal.fire("Usuario eliminada", "", "success");
    } catch (error) {
      console.error("Error eliminando usuario: ", error);
      Swal.fire("Error", "No se pudo eliminar al usuario", "error");
    }
  };
  
  const CambioDeRol = async (id)=>{
    
    const confirmed = await Swal.fire({
      title: "Cambiar rol del usuario?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cambiar",
      cancelButtonText: "Cancelar",
    });
    
    try {
      const userRef = doc(db, "usuarios", id);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.error("Error: El usuario no existe.");
        return;
      }
      if (!confirmed.isConfirmed) return;
      
      Swal.fire({
        title: "Cambiando rol del usuario...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      const nuevoRol = userSnap.data().role === "user" ? "admin" : "user";
      await updateDoc(userRef, { role: nuevoRol });
      Swal.fire("Rol cambiado", "", "success");
      setUsuarios((prev) =>
        prev.map((user) => (user.id === id ? { ...user, role: nuevoRol } : user))
      );
      
    } catch (error) {
      console.error("Error al cambiar de rol", error);
      Swal.fire("Error", "No se pudo cambiar el rol", "error");
    }
  }


  return (
    <>
      <div>
        <NavBar companyName="Mi Empresa"/>
      </div>
      {loading ? (
        <Loading />
      ) : (
        <div className="table-container">
          <Link to={`/noAceptados`} state={{ usuarios }} className="botonNoAceptados">
              No Aceptados
          </Link>
          <br/>    
          <h2>Lista de Usuarios Registrados</h2>
          <div className="filtros">
            <h4>Filtrar</h4>
            <div className="labelsFiltros">
              <label>
                <input
                  type="text"
                  placeholder="Localidad"
                  value={filtros.localidad}
                  onChange={(e) => setFiltros({ ...filtros, localidad: e.target.value })}
                />
              </label>
              <label>
                <input
                  type="text"
                  placeholder="Estado"
                  value={filtros.estado}
                  onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                />
              </label>
              <label>
                <input
                  type="text"
                  placeholder="Nombre"
                  value={filtros.nombre}
                  onChange={(e) => setFiltros({ ...filtros, nombre: e.target.value })}
                />
              </label>
            </div>
          </div>

        <table>
          <thead>
            <tr>
              <th className="hidden-col">Rol</th>
              <th>Nombre</th>
              <th className="hidden-col">Email</th>
              <th>Localidad</th>
              <th>Estado</th>
              <th className="hidden-col-sm">Fecha de Inicio</th>
              <th className="hidden-col-sm">Fecha de Vencimiento</th>
              <th className="hidden-col">Imagen</th>
              <th>Detalles</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {
              usuarios
              .filter(usuario =>
                usuario.aceptado === true &&
                (filtros.localidad === '' || usuario.localidad?.toLowerCase().includes(filtros.localidad.toLowerCase())) &&
                (filtros.estado === '' || usuario.estado?.toLowerCase().includes(filtros.estado.toLowerCase())) &&
                (filtros.nombre === '' || `${usuario.nombre} ${usuario.apellido}`.toLowerCase().includes(filtros.nombre.toLowerCase()))
              )
              .map((usuario) => (
                <tr key={usuario.id}>
                  
                  <td className="hidden-col"><button className="buttonAdmin"  onClick={()=>CambioDeRol(usuario.id)}>{usuario.role}</button></td>
                  <td>{usuario.nombre} {usuario.apellido}</td>
                  <td className="hidden-col">{usuario.email}</td>
                  <td>{usuario.localidad}</td>
                  <td>{usuario.role==="user"? usuario.estado:"Es admin"}</td>
                  <td className="hidden-col-sm">
                    <input
                      type="date"
                      name="fechaDeInicio"
                      value={safeFormatDate(usuario.fechaDeInicio)}
                      onChange={(e) => {
                        HandleChangeFecha(usuario.id, "fechaDeInicio", e.target.value)
                          .then((nuevoUsuario) => {
                            if (!nuevoUsuario) return;
                            setUsuarios((prev) =>
                              prev.map((user) =>
                                user.id === usuario.id ? { ...user, ...nuevoUsuario } : user
                              )
                            );
                          });
                      }}
                      disabled={usuario.estado==="inactivo" || !solicitudes[usuario.id]?.reserva}
                    />
                  </td>

                  <td className="hidden-col-sm">
                    <input
                      type="date"
                      name="fechaDeVencimiento"
                      value={safeFormatDate(usuario.fechaDeVencimiento)}
                      onChange={(e) => {
                        HandleChangeFecha(usuario.id, "fechaDeVencimiento", e.target.value)
                          .then((nuevoUsuario) => {
                            if (!nuevoUsuario) return;
                            setUsuarios((prev) =>
                              prev.map((user) =>
                                user.id === usuario.id ? { ...user, ...nuevoUsuario } : user
                              )
                            );
                          });
                      }}
                      disabled={usuario.estado==="inactivo" || !solicitudes[usuario.id]?.reserva}
                    />
                  </td>

                  <td className="hidden-col">{localStorage.getItem(`uploadedImage_${usuario?.email}`)?(
                      <button 
                        className="buttonAdmin" 
                        onClick={()=>handelImageClick(localStorage.getItem(`uploadedImage_${usuario?.email}`))} 
                      >
                        Ver Imagen
                      </button>):(
                        <p>No hay imagen</p>
                      )
                    }
                  </td>
                  <td>
                    <button className="buttonAdmin" disabled={usuario.role==="admin"} onClick={()=>navigate("/userDetails",{state:{id:usuario.id}})}>
                      <span className="icon">🔍</span>
                      <span className="text">Ver más</span>
                    </button>
                  </td>
                  <td>
                    <button className="botonBajaUsuario" onClick={() => ManejarBaja(usuario.id)}>
                      <span className="icon">❌</span>
                      <span className="text">Borrar</span>
                    </button>
                  </td>
                </tr>
              ))
            }  
          </tbody>
        </table>
        
        {/* Modal de imagen */}
      {selectedImage && (
        <div className="image-modal" onClick={closeImageModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage} alt="Imagen de usuario"/>
          </div>
        </div>
      )}
      </div>
    )}
    </>
  );
};

export default Admin;

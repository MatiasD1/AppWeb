import React, { useState, useEffect } from "react";
import {  db } from "../firebaseConfig";
import NavBar from "./navBar";
import { 
  getDocs,
  collection,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  Timestamp
} from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import Loading from "./Loading";
import Swal from "sweetalert2";

const Admin = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage,setSelectedImage] = useState(null);
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

  

  useEffect(() => {
    const obtenerUsuarios = async () => {
      const usuariosSnapshot = await getDocs(collection(db, "usuarios"));
  
      const usuariosData = usuariosSnapshot.docs.map((usuarioDoc) => {
        const data = usuarioDoc.data();
        
        // Aquí debería evaluarse si está activo, pendiente o inactivo
        const fechaInicio = data.fechaDeInicio?.toDate();
        const fechaVencimiento = data.fechaDeVencimiento?.toDate();
        const hoy = new Date();
  
        let estado = "pendiente"; // Valor por defecto
  
        if (fechaInicio && fechaVencimiento && hoy >= fechaInicio && hoy <= fechaVencimiento) {
          estado = "activo";
        } else if (fechaVencimiento && hoy > fechaVencimiento) {
          estado = "inactivo";
        }
  
        return {
          id: usuarioDoc.id,
          ...data,
          estado: estado, // Aquí asignamos el estado calculado
        };
      });
  
      setUsuarios(usuariosData);
      setLoading(false);
    };
  
    obtenerUsuarios();
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

  const ajustarFechaBuenosAires = (fechaStr) => {
    const fecha = new Date(fechaStr);
    fecha.setUTCHours(3, 0, 0, 0); // Ajustar a medianoche en Buenos Aires (UTC-3)
    return fecha;
  };

  
  const handleChange = async (id, campo, valor) => {
    const fechaAjustada = valor === "" ? null : Timestamp.fromDate(ajustarFechaBuenosAires(valor));
    const hoy = new Date();
    const confirmed = await Swal.fire({
      title: "¿Modificar fecha?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, modificar",
      cancelButtonText: "Cancelar",
    });
    if (!confirmed.isConfirmed) return;
    
    try {
      const userRef = doc(db, "usuarios", id);
      await updateDoc(userRef, {
        [campo]: fechaAjustada
      });
  
      // Verificamos el estado luego de modificar las fechas
      const usuarioDoc = await getDoc(userRef);
      const data = usuarioDoc.data();
      const fechaInicio = data.fechaDeInicio?.toDate();
      const fechaVencimiento = data.fechaDeVencimiento?.toDate();
      let estado = "inactivo";
  
      if (fechaInicio && fechaVencimiento && hoy >= fechaInicio && hoy <= fechaVencimiento) {
        estado = "activo";
      } else if (fechaVencimiento && hoy > fechaVencimiento) {
        await deleteDoc(doc(db, "solicitudes", id)); // Eliminar solicitud si está vencido
        estado = "inactivo";
      } else {
        estado = "pendiente";
      }
  
      // Actualizamos el estado local
      await updateDoc(userRef, { estado });
  
      setUsuarios((prev) =>
        prev.map((user) =>
          user.id === id
            ? { ...user, estado, fechaInicio, fechaVencimiento }
            : user
        )
      );
  
      Swal.fire("Fecha y estado actualizados correctamente", "", "success");
    } catch (error) {
      console.error("Error al actualizar:", error);
      Swal.fire("Error", "No se pudo actualizar las fechas", "error");
    }
  };
  
  
  

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
                      value={
                        usuario.fechaDeInicio
                          ? usuario.fechaDeInicio.toDate().toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) => handleChange(usuario.id, "fechaDeInicio", e.target.value)}
                    />
                  </td>

                  <td className="hidden-col-sm">
                    <input
                      type="date"
                      name="fechaDeVencimiento"
                      value={
                        usuario.fechaDeVencimiento
                          ? usuario.fechaDeVencimiento.toDate().toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        handleChange(usuario.id, "fechaDeVencimiento", e.target.value)
                      }
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

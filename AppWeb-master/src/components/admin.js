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
      const solicitudesSnapshot = await getDocs(collection(db, "solicitudes"));
  
      const usuariosData = usuariosSnapshot.docs.map((usuarioDoc) => {
        const data = usuarioDoc.data();
        const solicitudDoc = solicitudesSnapshot.docs.find((s) => s.id === usuarioDoc.id);
        
        return {
          id: usuarioDoc.id,
          ...data,
          estado: solicitudDoc ? "pendiente" : "inactivo", // No se evalúa activación acá
        };
      });
  
      setUsuarios(usuariosData);
      setLoading(false);
    };
  
    obtenerUsuarios();
  }, []);
  
  
  

  const ManejarBaja = async (id) => {
    try {
      if (window.confirm("¿Estás seguro que deseas eliminar este usuario?")) {
        await deleteDoc(doc(db, "usuarios", id));
        setUsuarios(usuarios.filter((user) => user.id !== id));
      }
    } catch (error) {
      console.error("Error eliminando usuario: ", error);
    }
  };


  
  const CambioDeRol = async (id)=>{
    try {
      const userRef = doc(db, "usuarios", id);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.error("Error: El usuario no existe.");
        return;
      }
      
      const nuevoRol = userSnap.data().role === "user" ? "admin" : "user";
      await updateDoc(userRef, { role: nuevoRol });

      setUsuarios((prev) =>
        prev.map((user) => (user.id === id ? { ...user, role: nuevoRol } : user))
      );
      
    } catch (error) {
      console.error("Error al cambiar de rol", error);
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
  
    try {
      const userRef = doc(db, "usuarios", id);
      await updateDoc(userRef, {
        [campo]: fechaAjustada
      });
  
      const usuarioDoc = await getDoc(userRef);
      const data = usuarioDoc.data();
  
      const fechaInicio = data.fechaDeInicio?.toDate?.();
      const fechaVencimiento = data.fechaDeVencimiento?.toDate?.();
  
      let estado = "inactivo";
      let fechasActualizadas = {};
  
      const solicitudRef = doc(db, "solicitudes", id);
      const solicitudDoc = await getDoc(solicitudRef);
  
      if (solicitudDoc.exists()) {
        if (fechaInicio && fechaVencimiento && hoy >= fechaInicio && hoy <= fechaVencimiento) {
          estado = "activo";
        } else if (fechaVencimiento && hoy > fechaVencimiento) {
          // vencido: eliminamos solicitud y reseteamos fechas
          await deleteDoc(solicitudRef);
          await updateDoc(userRef, {
            fechaDeInicio: null,
            fechaDeVencimiento: null,
          });
          estado = "inactivo";
          fechasActualizadas = {
            fechaDeInicio: null,
            fechaDeVencimiento: null,
          };
        } else {
          estado = "pendiente";
        }
      }
  
      await updateDoc(userRef, {
        estado: estado
      });
  
      // 🔄 Actualizamos el estado local con estado y fechas actualizadas (si las hay)
      setUsuarios((prev) =>
        prev.map((user) =>
          user.id === id
            ? {
                ...user,
                ...data,
                ...fechasActualizadas,
                estado,
              }
            : user
        )
      );
  
      alert("Fecha y estado actualizados correctamente");
    } catch (error) {
      console.error("Error al actualizar:", error);
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
              <th>Rol</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Localidad</th>
              <th>Estado</th>
              <th>Fecha de Inicio</th>
              <th>Fecha de Vencimiento</th>
              <th>Imagen</th>
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
                  
                  <td><button className="buttonAdmin"  onClick={()=>CambioDeRol(usuario.id)}>{usuario.role}</button></td>
                  <td>{usuario.nombre} {usuario.apellido}</td>
                  <td>{usuario.email}</td>
                  <td>{usuario.localidad}</td>
                  <td>{usuario.role==="user"? usuario.estado:"Es admin"}</td>
                  <td>
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

                  <td>
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

                  <td>{localStorage.getItem(`uploadedImage_${usuario?.email}`)?(
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
                    <button className="buttonAdmin" disabled={usuario.role==="admin"} onClick={()=>navigate("/userDetails",{state:{id:usuario.id}})}>Ver más</button>
                  </td>
                  <td>
                    <button className="botonBajaUsuario" onClick={() => ManejarBaja(usuario.id)}>
                      Dar de baja
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

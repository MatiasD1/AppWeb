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
  const [editandoId, setEditandoId] = useState(null);
  const [fechas, setFechas] = useState({});
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

  

  const obtenerUsuarios = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "usuarios"));
      const usuariosData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsuarios(usuariosData);
      setLoading(false);
    } catch (error) {
      console.error("Error obteniendo usuarios: ", error);
    }
  };

  useEffect(() => {
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

  
  const handleChange = (id, campo, valor) => {
    setFechas((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [campo]: valor === "" ? null : valor, // Guarda null si el input está vacío
      },
    }));
  };
  
  
  const ajustarFechaBuenosAires = (fechaStr) => {
    const fecha = new Date(fechaStr);
    fecha.setUTCHours(3, 0, 0, 0); // Ajustar a medianoche en Buenos Aires (UTC-3)
    return fecha;
  };

  
  const handleEdit = async (id) => {
    if (editandoId === id) {
      try {
        // Obtenemos las nuevas fechas, si no existen tomamos las anteriores
        const nuevasFechas = fechas[id] || {};
        
        const usuarioActual = usuarios.find((user) => user.id === id);

        const fechaDeInicio = nuevasFechas.fechaDeInicio
          ? ajustarFechaBuenosAires(nuevasFechas.fechaDeInicio)
          : usuarioActual.fechaDeInicio
          ? usuarioActual.fechaDeInicio.toDate()
          : null;

        const fechaDeVencimiento = nuevasFechas.fechaDeVencimiento
          ? ajustarFechaBuenosAires(nuevasFechas.fechaDeVencimiento)
          : usuarioActual.fechaDeVencimiento
          ? usuarioActual.fechaDeVencimiento.toDate()
          : null;

  
          const cambios = {};
          if (nuevasFechas.fechaDeInicio !== undefined) {
            cambios.fechaDeInicio = nuevasFechas.fechaDeInicio
              ? Timestamp.fromDate(fechaDeInicio)
              : null; // Permitir valores nulos
          }
          if (nuevasFechas.fechaDeVencimiento !== undefined) {
            cambios.fechaDeVencimiento = nuevasFechas.fechaDeVencimiento
              ? Timestamp.fromDate(fechaDeVencimiento)
              : null; // Permitir valores nulos
          }
  
        if (Object.keys(cambios).length > 0) {
          const userRef = doc(db, "usuarios", id);
          await updateDoc(userRef, cambios);
  
          // Actualizamos el estado local de los usuarios con las fechas convertidas a Timestamp
          setUsuarios((prev) =>
            prev.map((user) =>
              user.id === id
                ? {
                    ...user,
                    ...cambios,
                  }
                : user
            )
          );
        }
        
        setEditandoId(null); // Desactivamos el modo de edición
      } catch (error) {
        console.error("Error guardando fechas:", error);
      }
    } else {
      setEditandoId(id); // Si no estamos editando, activamos el modo de edición
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
        <h2>Lista de administradores</h2>
            {usuarios.length > 0 ? (
                <table border="1">
                    <thead>
                        <tr>
                            <th>Rol</th>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios
                        .filter(usuario => usuario.role==="admin")
                        .map((admin) => (
                            <tr key={admin.id}>
                                <td><button className="button-user one"  onClick={()=>CambioDeRol(admin.id)} disabled={admin.nombre==="Martin"}>{admin.role}</button></td>
                                <td>{admin.nombre}</td>
                                <td>{admin.apellido}</td>
                                <td>{admin.email}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No hay administradores registrados.</p>
            )}
        <br/>    
        <h2>Lista de Usuarios Registrados</h2>
        <div className="filtros">
  <label>
    Localidad:
    <input
      type="text"
      value={filtros.localidad}
      onChange={(e) => setFiltros({ ...filtros, localidad: e.target.value })}
    />
  </label>
  <label>
    Estado:
    <input
      type="text"
      value={filtros.estado}
      onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
    />
  </label>
  <label>
    Nombre:
    <input
      type="text"
      value={filtros.nombre}
      onChange={(e) => setFiltros({ ...filtros, nombre: e.target.value })}
    />
  </label>
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
              <th>Finalizado</th>
              <th>Imagen</th>
              <th></th>
              <th>Ver Detalles</th>
              <th>Editar</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10">Cargando usuarios...</td>
              </tr>
            ) : (
              usuarios
              .filter(usuario =>
                usuario.aceptado === true &&
                usuario.role === "user" &&
                (filtros.localidad === '' || usuario.localidad?.toLowerCase().includes(filtros.localidad.toLowerCase())) &&
                (filtros.estado === '' || usuario.estado?.toLowerCase().includes(filtros.estado.toLowerCase())) &&
                (filtros.nombre === '' || `${usuario.nombre} ${usuario.apellido}`.toLowerCase().includes(filtros.nombre.toLowerCase()))
              )
              .map((usuario) => (
                <tr key={usuario.id}>
                  
                  <td><button className="button-user one"  onClick={()=>CambioDeRol(usuario.id)}>{usuario.role}</button></td>
                  <td>{usuario.nombre} {usuario.apellido}</td>
                  <td>{usuario.email}</td>
                  <td>{usuario.localidad}</td>
                  <td>{usuario.estado}</td>
                  <td>
                    <input
                      type="date"
                      name="fechaDeInicio"
                      value={fechas[usuario.id]?.fechaDeInicio ||
                        (usuario.fechaDeInicio ? usuario.fechaDeInicio.toDate().toISOString().split("T")[0] : "")}
                      onChange={(e) => handleChange(usuario.id, "fechaDeInicio", e.target.value)}
                      disabled={!usuario.fechaDeInicio || editandoId !== usuario.id}
                      
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      name="fechaDeVencimiento"
                      value={fechas[usuario.id]?.fechaDeVencimiento ||
                        (usuario.fechaDeVencimiento ? usuario.fechaDeVencimiento.toDate().toISOString().split("T")[0] : "")}
                      onChange={(e) => handleChange(usuario.id, "fechaDeVencimiento", e.target.value)}
                      disabled={!usuario.fechaDeVencimiento || editandoId !== usuario.id}
                     
                    />
                  </td>

                  <td>{usuario.finalizado?"Si":"No"}</td>

                  <td >{localStorage.getItem(`uploadedImage_${usuario?.email}`) && (
                    <button className="button-user one" onClick={()=>handelImageClick(localStorage.getItem(`uploadedImage_${usuario?.email}`))}>
                      Ver Imagen
                  </button>)}</td>
                  <td>
                    <button className="botonBajaUsuario" onClick={() => ManejarBaja(usuario.id)}>
                      Dar de baja
                    </button>
                  </td>
                  <td>
                    <button className="button-user one" onClick={()=>navigate("/userDetails",{state:{id:usuario.id}})}>Detalles</button>
                  </td>
                  <td>
                    <button className="botonBajaUsuario" onClick={() => handleEdit(usuario.id)}>
                      {editandoId === usuario.id ? "Guardar" : "Editar"}
                    </button>
                  </td>

                </tr>
              ))
            )}
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

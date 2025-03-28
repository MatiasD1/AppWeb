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

const Admin = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage,setSelectedImage] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [fechas, setFechas] = useState({});
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
      [id]: { ...prev[id], [campo]: valor },
    }));
  };
  

  const handleEdit = async (id) => {
    if (editandoId === id) {
      try {
        // 1. Actualizar el estado con los nuevos valores de las fechas (sin esperar Firestore)
        const nuevaFechaDeInicio = fechas[id]?.fechaDeInicio
          ? new Date(fechas[id].fechaDeInicio)
          : usuarios.find((user) => user.id === id).fechaDeInicio.toDate();
  
        const nuevaFechaDeVencimiento = fechas[id]?.fechaDeVencimiento
          ? new Date(fechas[id].fechaDeVencimiento)
          : usuarios.find((user) => user.id === id).fechaDeVencimiento.toDate();
  
        setUsuarios((prev) =>
          prev.map((user) =>
            user.id === id
              ? {
                  ...user,
                  fechaDeInicio: nuevaFechaDeInicio,
                  fechaDeVencimiento: nuevaFechaDeVencimiento,
                }
              : user
          )
        );
  
        // 2. Luego, actualizar Firestore con los nuevos valores
        const userRef = doc(db, "usuarios", id);
        await updateDoc(userRef, {
          fechaDeInicio: Timestamp.fromDate(nuevaFechaDeInicio),
          fechaDeVencimiento: Timestamp.fromDate(nuevaFechaDeVencimiento),
        });
  
        // 3. Finalizar la edición
        setEditandoId(null);
  
      } catch (error) {
        console.error("Error guardando fechas:", error);
      }
    } else {
      // Activar edición si no se está editando
      setEditandoId(id);
    }
  };
  
    

  return (
    <>
      <div>
        <NavBar companyName="Mi Empresa"/>
      </div>
      <div className="table-container">
      <Link to={`/noAceptados`} state={{ usuarios }} className="botonNoAceptados">
          No Aceptados
        </Link>
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
              .filter(usuario => usuario.aceptado === true) 
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
                      usuario.fechaDeInicio.toDate().toISOString().split("T")[0]}
                    onChange={(e)=>handleChange(usuario.id,"fechaDeInicio",e.target.value)}
                    disabled={editandoId!==usuario.id}>
                    </input>
                  </td>
                  <td>
                    <input 
                    type="date" 
                    name="fechaDeVencimiento"
                    value={fechas[usuario.id]?.fechaDeVencimiento ||
                      usuario.fechaDeVencimiento.toDate().toISOString().split("T")[0]}
                    onChange={(e)=>handleChange(usuario.id,"fechaDeVencimiento",e.target.value)}
                    disabled={editandoId!==usuario.id}>
                    </input>
                  </td>
                  <td>{usuario.finalizado}</td>
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
                    <button className="botonBajaUsuario" onClick={()=>handleEdit(usuario.id)}>{editandoId? "Guardar":"Editar"}</button>
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
    </>
  );
};

export default Admin;

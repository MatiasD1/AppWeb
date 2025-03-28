import React, { useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig";
import { getUserName } from "../auth";
import { onAuthStateChanged } from "firebase/auth";
import NavBar from "./navBar";
import {
  getDocs,
  collection,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

const Admin = () => {
  const [userName, setUserName] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage,setSelectedImage] = useState(null);
  const navigate = useNavigate();


  const handelImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  }

  const closeImageModal = () =>{
    setSelectedImage(null);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const name = await getUserName(user.uid);
        setUserName(name);
      } else {
        setUserName(null);
      }
    });

    return () => unsubscribe();
  }, []);

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

  return (
    <>
      <div>
        <NavBar companyName="Mi Empresa" userName={userName} />
      </div>
      <div className="table-container">
      <Link to={`/noAceptados`} state={{ usuarios }} className="botonNoAceptados">
          No Aceptados
        </Link>
        <br/>
        <br/>
        <br/>
        <br/>
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
              <th >Imagen</th>
              <th></th>
              <th>Detalles</th>
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
                  <td>{usuario.fechaDeInicio?.toDate().toLocaleDateString()}</td>
                  <td>{usuario.fechaDeVencimiento?.toDate().toLocaleDateString()}</td>
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
                    <button className="button-user one" onClick={()=>navigate("/userDetails",{state:{id:usuario.id}})}> Ver Detalles</button>
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

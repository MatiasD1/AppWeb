import React, {  useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import NavBar from './navBar';
import { Link } from 'react-router-dom';

const NoAceptados = () => {

    const[usuarios,setUsuarios]=useState([]);
    const[cargando,setCargando]=useState(true);
    const location = useLocation();

    useEffect(()=>{
      setTimeout(()=>{
        setUsuarios(location.state.usuarios);
        setCargando(false);
      },2000);
    },[location.state.usuarios])
    
    const filtroUsuarios = !cargando
    ? usuarios.filter((usuario)=>usuario.aceptado===false):[];
    
    
    const RechazarUsuario = async (id)=>{
        try {
            if (window.confirm("Estás seguro que deseas rechazar a este usuario?")) {
              const userRef = doc(db, "usuarios", id);
              await deleteDoc(userRef);
              setUsuarios(usuarios.filter(user => user.id !== id));
            }
          } catch (error) {
            console.error("Error dando de baja al usuario: ", error);
          }
    }

    const AceptarUsuario = async (id) =>{
      try{
        if (window.confirm("Estas seguro de aceptar a este usuario?")){
          const userRef = doc(db,"usuarios",id);
          await updateDoc(userRef, { aceptado: true });
          console.log("Usuario aceptado");
        }
      }catch(error){
        console.error("Error al aceptar al usuario");
      }
    }

    return (
        <>
        <NavBar/><Link to={`/admin`}>Volver</Link>
        <div className='table-container'>
        <table>
          <thead>
            <tr>
              <th>Id</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Licencia</th>
              <th>Marca del Auto</th>
              <th>Modelo del Auto</th>
              <th>Aceptar</th>
              <th>Rechazar</th>
            </tr>
          </thead>
          <tbody>
            {
              filtroUsuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td>{usuario.id}</td>
                  <td>{usuario.nombre}{usuario.apellido}</td>
                  <td>{usuario.email}</td>
                  <td>{usuario.licencia}</td>
                  <td>{usuario.marcaAuto}</td>
                  <td>{usuario.modeloAuto}</td>
                  <td><button onClick={()=>AceptarUsuario(usuario.id)} style={{color:"green"}}>Aceptar</button></td>
                  <td><button onClick={() => RechazarUsuario(usuario.id)} style={{ color: "red" }}>Rechazar</button></td>
                </tr>            
              ))
            }
          </tbody>
        </table>
      </div>
      </>
  )
}

export default NoAceptados;

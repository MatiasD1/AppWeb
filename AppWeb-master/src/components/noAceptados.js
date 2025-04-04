import React, {  useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, deleteDoc, updateDoc, getDocs, collection } from 'firebase/firestore';
import NavBar from './navBar';
import { useCallback } from 'react';

const NoAceptados = () => {

    const[usuarios,setUsuarios]=useState([]);
    const location = useLocation();

    useEffect(() => {
      if (location.state?.usuarios) {
          setUsuarios(location.state.usuarios.filter(user => user.aceptado===false));
      } else {
          const fetchUsuarios = async () => {
              try {
                  const querySnapshot = await getDocs(collection(db, 'usuarios'));
                  const userList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                  setUsuarios(userList.filter(user => !user.aceptado));
              } catch (error) {
                  console.error('Error al obtener usuarios:', error);
              }
          };
          fetchUsuarios();
      }
  }, [location.state]);
    
    const RechazarUsuario = useCallback(async (id)=>{
        try {
            if (window.confirm("Estás seguro que deseas rechazar a este usuario?")) {
              const userRef = doc(db, "usuarios", id);
              await deleteDoc(userRef);
              setUsuarios(usuarios.filter(user => user.id !== id));
            }
          } catch (error) {
            console.error("Error dando de baja al usuario: ", error);
          }
    },[usuarios]);

    const AceptarUsuario = useCallback(async (id) =>{
      try{
        if (window.confirm("Estas seguro de aceptar a este usuario?")){
          const userRef = doc(db,"usuarios",id);
          await updateDoc(userRef, { aceptado: true });
          setUsuarios(usuarios.filter(user => user.id !== id));
          console.log("Usuario aceptado");
        }
      }catch(error){
        console.error("Error al aceptar al usuario");
      }
    },[usuarios]);

    return (
        <>
        <NavBar/>
        <div className='table-container'>
          <h2>Pendientes de Aceptación</h2>
          {usuarios.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Localidad</th>
                <th>Aceptar</th>
                <th>Rechazar</th>
              </tr>
            </thead>
            <tbody>
              {
                usuarios.map((usuario) => (
                  <tr key={usuario.id}>
                    <td>{usuario.nombre}{usuario.apellido}</td>
                    <td>{usuario.email}</td>
                    <td>{usuario.localidad}</td>
                    <td><button className='button-user one' onClick={()=>AceptarUsuario(usuario.id)} >Aceptar</button></td>
                    <td><button className='button-user two' onClick={() => RechazarUsuario(usuario.id)}>Rechazar</button></td>
                  </tr>            
                ))
              } 
            </tbody>
          </table>
          ):(
            <p>No hay usuarios pendientes de aceptación.</p>
          )}
        </div>
      </>
    )
};

export default NoAceptados;

import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, deleteDoc, updateDoc, getDocs, collection } from 'firebase/firestore';
import NavBar from './navBar';
import Loading from './Loading';
import Swal from 'sweetalert2';

const NoAceptados = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true); // nuevo estado para loading
  const location = useLocation();

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        if (location.state?.usuarios) {
          setUsuarios(location.state.usuarios.filter(user => user.aceptado === false));
        } else {
          const querySnapshot = await getDocs(collection(db, 'usuarios'));
          const userList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setUsuarios(userList.filter(user => !user.aceptado));
        }
      } catch (error) {
        console.error('Error al obtener usuarios:', error);
      } finally {
        setLoading(false); // se termina la carga
      }
    };
    fetchUsuarios();
  }, [location.state]);

  const RechazarUsuario = useCallback(async (id) => {
    const confirm =await Swal.fire({
      title: "¿Rechazar usuario?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, rechazar",
      cancelButtonText: "Cancelar",
    })
    if (!confirm.isConfirmed)return;
    try {
      const userRef = doc(db, "usuarios", id);
      await deleteDoc(userRef);
      setUsuarios(prev => prev.filter(user => user.id !== id));
      Swal.fire("Usuario rechazado", "", "success");
    } catch (error) {
      console.error("Error dando de baja al usuario: ", error);
      Swal.fire("Error", "No se pudo rechazar al usuario", "error");
    }
  }, []);

  const AceptarUsuario = useCallback(async (id) => {
    const confirmed = await Swal.fire({
          title: "Aceptar usuario?",
          text: "Esta acción no se puede deshacer.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Sí, aceptar",
          cancelButtonText: "Cancelar",
        });
    if (!confirmed.isConfirmed) return;
    
    try {
      
        const userRef = doc(db, "usuarios", id);
        await updateDoc(userRef, { aceptado: true });
        setUsuarios(prev => prev.filter(user => user.id !== id));
        console.log("Usuario aceptado");
        Swal.fire("Usuario aceptado", "", "success");
    } catch (error) {
      console.error("Error al aceptar al usuario");
      Swal.fire("Error", "No se pudo aceptar al usuario", "error");
    }
  }, []);

  return (
    <>
      <NavBar />
      <div className='table-container'>
        <h2>Pendientes de Aceptación</h2>
        {loading ? (
          <Loading/> 
        ) : usuarios.length > 0 ? (
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
              {usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td>{usuario.nombre}{usuario.apellido}</td>
                  <td>{usuario.email}</td>
                  <td>{usuario.localidad}</td>
                  <td>
                    <button className='button-user one' onClick={() => AceptarUsuario(usuario.id)}>
                      <span className="icon">✅</span>
                      <span className="text">Aceptar</span>
                    </button>
                  </td>
                  <td>
                    <button className='button-user two' onClick={() => RechazarUsuario(usuario.id)}>
                      <span className="icon">❌</span>
                      <span className="text">Rechazar</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay usuarios pendientes de aceptación.</p>
        )}
      </div>
    </>
  );
};

export default NoAceptados;

import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { getUserName } from '../auth';
import { onAuthStateChanged } from 'firebase/auth';
import NavBar from './navBar';
import { getDocs, collection, deleteDoc, doc } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const Admin = () => {
  const [userName, setUserName] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Función para obtener los usuarios desde Firestore
  const obtenerUsuarios = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "usuarios"));
      const usuariosData = querySnapshot.docs.map((doc) => ({
        id:doc.id,
        ...doc.data()
      }));
      setUsuarios(usuariosData); // Actualiza el estado con los datos
      setLoading(false);
    } catch (error) {
      console.error("Error obteniendo usuarios: ", error);
    }
  };

  // Ejecuta la función al cargar el componente
  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const ManejarBaja = async (id) => {
    try {
      if (window.confirm("Estás seguro que deseas eliminar este usuario?")) {
        const userRef = doc(db, "usuarios", id);
        await deleteDoc(userRef);
        setUsuarios(usuarios.filter(user => user.id !== id));
      }
    } catch (error) {
      console.error("Error dando de baja al usuario: ", error);
    }
  };

  return (
    <>
      <div className='user-container'>
        <NavBar companyName="Mi Empresa" userName={userName}/>
      </div>
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
              <th>Baja</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7">Cargando usuarios...</td>
              </tr>
            ) : (
              usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td>{usuario.id}</td>
                  <td>{usuario.nombre}{usuario.apellido}</td>
                  <td>{usuario.email}</td>
                  <td>{usuario.licencia}</td>
                  <td>{usuario.marcaAuto}</td>
                  <td>{usuario.modeloAuto}</td>
                  <td>
                    <button onClick={() => ManejarBaja(usuario.id)} style={{ color: "red" }}>
                      Dar de baja
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Link to={`/noAceptados`}state={{usuarios}}>No Aceptados</Link>
      </div>
    </>
  );
};

export default Admin;
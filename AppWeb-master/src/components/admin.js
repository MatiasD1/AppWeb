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
import { Link } from "react-router-dom";

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

  const Ascenso = async (id) => {
    try {
      const userRef = doc(db, "usuarios", id);
      await updateDoc(userRef, { role: "admin" });
      console.log("Usuario ascendido a admin");

      setUsuarios((prevUsuarios) =>
        prevUsuarios.map((usuario) =>
          usuario.id === id ? { ...usuario, role: "admin" } : usuario
        )
      );
    } catch (error) {
      console.error("Error al ascender al usuario", error);
    }
  };

  const Descenso = async (id) => {
    try {
      const userRef = doc(db, "usuarios", id);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.error("Error: El usuario no existe.");
        return;
      }

      if (userSnap.data().role === "user") {
        console.log("El usuario ya es 'user'.");
        return;
      }

      await updateDoc(userRef, { role: "user" });
      console.log("Administrador descendido a usuario");

      setUsuarios((prevUsuarios) =>
        prevUsuarios.map((usuario) =>
          usuario.id === id ? { ...usuario, role: "user" } : usuario
        )
      );
    } catch (error) {
      console.error("Error al descender al usuario", error);
    }
  };

  return (
    <>
      <div>
        <NavBar companyName="Mi Empresa" userName={userName} />
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Ascenso</th>
              <th>Descenso</th>
              <th>Rol</th>
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
                <td colSpan="10">Cargando usuarios...</td>
              </tr>
            ) : (
              usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td>{usuario.id}</td>
                  <td>
                    <button onClick={() => Ascenso(usuario.id)}>Ascender</button>
                  </td>
                  <td>
                    <button onClick={() => Descenso(usuario.id)}>Descender</button>
                  </td>
                  <td>{usuario.role}</td>
                  <td>{usuario.nombre} {usuario.apellido}</td>
                  <td>{usuario.email}</td>
                  <td>{usuario.licencia}</td>
                  <td>{usuario.marcaAuto}</td>
                  <td>{usuario.modeloAuto}</td>
                  <td>
                    <button
                      onClick={() => ManejarBaja(usuario.id)}
                      style={{ color: "red" }}
                    >
                      Dar de baja
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Link to={`/noAceptados`} state={{ usuarios }}>
          No Aceptados
        </Link>
      </div>
    </>
  );
};

export default Admin;

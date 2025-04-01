import NavBar from "./navBar";
import Carrusel from "./Carrusel";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";

const User = () => {
  
  const [id, setId] = useState(null);
  const [loading, setLoading] = useState(true); // Estado para controlar la carga
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setId(user.uid);
        console.log("UID:", user.uid);
      } else {
        console.log("No hay usuario autenticado");
      }
      setLoading(false); // Una vez que se verifica el estado de autenticación, desactivamos el loading
    });

    // Cleanup function para desuscribirse cuando el componente se desmonta
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <p>Cargando...</p> {/* Aquí puedes poner un spinner o una animación de carga */}
        <div className="spinner"></div> {/* Este sería tu spinner, pero puedes personalizarlo */}
      </div>
    );
  }

  return (
    <div className="user-container">
      <NavBar />
      <div className="content">
        <Carrusel />
        <div className="button-group">
          <button className="button-user one" onClick={() => navigate("/solicitudTurno", {state: {id}})}>
            Pedir Turno
          </button>
          <button className="button-user two" onClick={() => navigate("/uploadImage", { state:{id}})}>
            Subir Foto
          </button>
        </div>
      </div>
    </div>
  );
};

export default User;

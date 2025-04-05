import NavBar from "./navBar";
import Carrusel from "./Carrusel";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import Loading from "./Loading";

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
    return <Loading />;
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

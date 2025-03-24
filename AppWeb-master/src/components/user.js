import NavBar from "./navBar";
import Carrusel from "./Carrusel";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";

const User = () => {
  
  const [id, setId] = useState(null);
  const navigate = useNavigate();

  useEffect(()=>{
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setId(user.uid);
        console.log("UID:", user.uid);
      } else {
        console.log("No hay usuario autenticado");
      }
    });
  },[]);
  

  return (
    <div className="user-container">
      <NavBar />
      <div className="content">
        <Carrusel />
        <div className="button-group">
          <Link className="button-user one" to={`/publicidad`} state={{id}} >
            Contratar Publicidad
          </Link>
          <button className="button-user two" onClick={() => navigate("/solicitar-publicidad")}>
            Pedir Turno
          </button>
        </div>
      </div>
    </div>
  );
};

export default User;

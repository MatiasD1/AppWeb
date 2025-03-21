import React, { useState, useEffect } from "react";
import { auth } from "../firebaseConfig";
import { getUserName } from "../auth";
import { onAuthStateChanged } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "./navBar";
import Carrusel from "./Carrusel";

const User = () => {
  const [userName, setUserName] = useState(null);
  const navigate = useNavigate();
  const [id, setId] = useState(null); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const { nombre, apellido } = await getUserName(user.uid);
        setUserName({ nombre, apellido });// 🔧 Guardamos un objeto en vez de una string
        setId(user.uid);
      } else {
        setUserName(null);
      }
    });

    return () => unsubscribe();
  }, []);


  return (
    <div className="user-container">
      <NavBar userName={userName} />
      <div className="content">
        <Carrusel />
        <div className="button-group">
          <Link className="button-user one"  to={`/publicidad`} state={{id}} >Contratar Publicidad</Link>
          <button className="button-user two" onClick={() => navigate("/turnos")}>
            Pedir Turno
          </button>
        </div>
      </div>
    </div>
  );
};

export default User;

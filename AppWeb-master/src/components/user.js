import React, { useState, useEffect } from "react";
import { auth } from "../firebaseConfig";
import { getUserName } from "../auth";
import Header from "./header";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import NavBar from "./navBar";
import Carrusel from "./Carrusel";

const User = () => {
  const [userName, setUserName] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const { nombre, apellido } = await getUserName(user.uid); // Obtenemos nombre y apellido
        setUserName(`${nombre} ${apellido}`); // Concatenamos nombre y apellido en una cadena
      } else {
        setUserName(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const message = "Esperamos que disfrutes de tu experiencia.";

  return (
    <div className="flex flex-col items-center">
      {/* Pasar userName al NavBar */}
      <NavBar companyName="Mi Empresa" userName={userName} />
      <div className="flex flex-col items-center gap-6 p-6 w-full">
        {userName && <Header userName={userName} message={message} />}
        {/* ✅ Carrusel agregado aquí */}
        <Carrusel />

        {/* ✅ Botones en fila de dos columnas */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-lg mt-6">
          <button
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            onClick={() => alert("Ir a publicidad")}
          >
            Ver detalles
          </button>
          <button
            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            onClick={() => navigate("/turnos")}
          >
            Sacar Turno
          </button>
        </div>
      </div>
    </div>
  );
};

export default User;

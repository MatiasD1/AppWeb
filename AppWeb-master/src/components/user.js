// User.js
import React, { useState, useEffect } from "react";
import { auth } from "../firebaseConfig";
import { getUserName } from "../auth"; // Asegúrate de importar la función de obtener el nombre
import LogoutButton from "./logout";
import Header from "./header";
import Presentation from "./presentation";
import { onAuthStateChanged } from "firebase/auth"; // Para escuchar el cambio de autenticación
import { useNavigate } from "react-router-dom"; // ✅ Importa useNavigate

const User = () => {

  const [userName, setUserName] = useState(null); // Estado para almacenar el nombre del usuario
  const navigate = useNavigate(); 

  useEffect(() => {
    // Escuchar los cambios de autenticación
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const name = await getUserName(user.uid); // Obtiene el nombre del usuario
        setUserName(name); // Almacena el nombre en el estado
      } else {
        setUserName(null); // Si no hay usuario, establece el nombre como null
      }
    });

    return () => unsubscribe(); // Limpiar el suscriptor al desmontar el componente
  }, []);

  // Definir el saludo y mensaje
  const message = "Esperamos que disfrutes de tu experiencia.";

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <LogoutButton />
      {userName && <Header userName={userName} message={message} />} {/* Pasar saludo y mensaje */}
      <Presentation
        title="Contratar Publicidad"
        description="Coloca publicidad en tu vehículo y genera ingresos."
        actions={[{ label: "Ver detalles", onClick: () => alert("Ir a publicidad") }]}
      />
      <Presentation
        title="Sacar Turno"
        description="Agenda un turno para la instalación de la publicidad."
        actions={[{ label: "Reservar turno", onClick: () => navigate("/turnos") }]}      />
    </div>
  );
};

export default User;

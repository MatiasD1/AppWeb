import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { setDoc, doc } from "firebase/firestore";
import { auth } from "../firebaseConfig";
import { getUserName } from "../auth";

const SolicitudPublicitar = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Función para manejar la solicitud
  const handleSolicitarPublicitar = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        setMessage("No estás autenticado.");
        setLoading(false);
        return;
      }

      const { nombre, apellido } = await getUserName(user.uid); // Obtenemos el nombre y apellido del usuario
      const solicitud = {
        usuarioId: user.uid,
        nombre: `${nombre} ${apellido}`,
        email: user.email,
        fecha: new Date(),
        estado: "pendiente", // El estado inicial es "pendiente"
      };

      // Guardamos la solicitud en la base de datos
      await setDoc(doc(db, "solicitudes", user.uid), solicitud);
      setMessage("¡Solicitud enviada con éxito! El administrador la revisará.");
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
      setMessage("Hubo un error al enviar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="solicitud-container">
      <h2>Solicitar Publicidad</h2>
      <p>Haz clic en el botón para enviar tu solicitud de publicidad. El administrador la revisará.</p>
      <button 
        className="button-solicitar"
        onClick={handleSolicitarPublicitar}
        disabled={loading}
      >
        {loading ? "Enviando..." : "Enviar Solicitud"}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default SolicitudPublicitar;

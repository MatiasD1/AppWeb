import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { auth } from "../firebaseConfig";
import { getUserName } from "../auth";
import NavBar from "./navBar";

const SolicitudTurno = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [solicitudEnviada, setSolicitudEnviada] = useState(false); // Estado para bloquear envío

  useEffect(() => {
    const verificarSolicitud = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const solicitudRef = doc(db, "solicitudes", user.uid);
      const solicitudSnap = await getDoc(solicitudRef);

      if (solicitudSnap.exists()) {
        setSolicitudEnviada(true); // Bloqueamos el botón si ya existe una solicitud
      }
    };

    verificarSolicitud();
  }, []);

  const handleSolicitarPublicitar = async () => {
    if (solicitudEnviada) {
      setMessage("Ya has enviado una solicitud. No puedes enviar otra.");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        setMessage("No estás autenticado.");
        setLoading(false);
        return;
      }

      const solicitudRef = doc(db, "solicitudes", user.uid);
      const solicitudSnap = await getDoc(solicitudRef);

      if (solicitudSnap.exists()) {
        setMessage("Ya has enviado una solicitud. No puedes enviar otra.");
        setLoading(false);
        return;
      }

      const { nombre, apellido } = await getUserName(user.uid);
      const solicitud = {
        usuarioId: user.uid,
        nombre: `${nombre} ${apellido}`,
        email: user.email,
        fecha: new Date(),
        estado: "pendiente",
      };

      await setDoc(solicitudRef, solicitud);
      setSolicitudEnviada(true); // Bloquear el botón después de enviar
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
      <NavBar/>
      <h2>Solicitar Publicidad</h2>
      <p>
        {solicitudEnviada 
          ? "Gracias por confiar en nosotros. Te avisaremos cuando sea aprobada y te enviaremos la fecha y hora de colocación."

          : "Haz clic en el botón para enviar tu solicitud de publicidad. El administrador la revisará."}
      </p>
      <button 
        className="button-solicitar"
        onClick={handleSolicitarPublicitar}
        disabled={loading || solicitudEnviada} // Bloquea si ya envió una solicitud
      >
        {loading ? "Enviando..." : solicitudEnviada ? "Solicitud Enviada" : "Enviar Solicitud"}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default SolicitudTurno;

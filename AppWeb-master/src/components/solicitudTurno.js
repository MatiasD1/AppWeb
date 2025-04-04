import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { setDoc, doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { auth } from "../firebaseConfig";
import { getUserName } from "../auth";
import NavBar from "./navBar";
import { useCallback } from "react";
import { InlineWidget } from "react-calendly";

const SolicitudTurno = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [solicitudEnviada, setSolicitudEnviada] = useState(false); // Estado para bloquear envío
  const [isLoading, setIsLoading] = useState(true); // Estado para controlar la carga
  const [solicitud, setSolicitud] = useState(null);
  const [usuario, setUsuario] = useState(null);

  
  const eventosCalendly = {
    "Buenos Aires": "https://calendly.com/evento-buenos-aires",
    "Córdoba": "https://calendly.com/evento-cordoba",
    "Rosario": "https://calendly.com/evento-rosario",
    "Mar del Plata":"https://calendly.com/agusgioia/new-meeting"
  };

  const eventoUrl = eventosCalendly[usuario?.localidad];

  useEffect(() => {
    const verificarSolicitud = async () => {
      const user = auth.currentUser;
      if (!user) {
        setIsLoading(false);
        return;
      }
      const userRef = doc(db,"usuarios",user.uid);
      const usuarioSnap = await getDoc(userRef);
      setUsuario(usuarioSnap.data());
      const solicitudRef = doc(db, "solicitudes", user.uid);
      const solicitudSnap = await getDoc(solicitudRef);

      if (solicitudSnap.exists()) {
        setSolicitudEnviada(true);
        setSolicitud(solicitudSnap.data());
      }
      
      setIsLoading(false); // Termina la carga
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

      const userRef = doc(db,"usuarios", user.uid);
      await updateDoc(userRef,{estado:"pendiente"});
      const solicitudRef = doc(db, "solicitudes", user.uid);
      const solicitudSnap = await getDoc(solicitudRef);

      if (solicitudSnap.exists()) {
        setMessage("Ya has enviado una solicitud. No puedes enviar otra.");
        setLoading(false);
        return;
      }

      const { nombre, apellido } = await getUserName(user.uid);
      const solicitud = {
        nombre: `${nombre} ${apellido}`,
        email: user.email,
        fecha: new Date(),
        estado: "solicitud pendiente",
        fechaColocacion: null
      };

      await setDoc(solicitudRef, solicitud);
      setSolicitudEnviada(true); 
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
      setMessage("Hubo un error al enviar la solicitud.");
    } finally {
      setLoading(false);
    }
  };


  const getFechaEventoCalendly = async (eventoUri) => {
    const token = process.env.REACT_APP_CALENDLY_TOKEN;
    console.log("Token:", process.env.REACT_APP_CALENDLY_TOKEN);
    try {
      const response = await fetch(eventoUri, {
        method: "GET",
        headers: {
          "Authorization":  `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error("Error al obtener evento desde Calendly");
      }
  
      const data = await response.json();
      return data.resource?.start_time; // Es un string ISO: "2025-04-03T19:00:00.000Z"
    } catch (error) {
      console.error("❌ Error al obtener la fecha del evento:", error);
      return null;
    }
  };
  

  const guardarTurno = useCallback(async (evento) => {
    try {
      console.log("Ejecutando guardar turno");
      const user = auth.currentUser;
      if (!user) throw new Error("Usuario no autenticado");
  
      const solicitudRef = doc(db, "solicitudes", user.uid);
      const startTime = await getFechaEventoCalendly(evento.event.uri); // Convierte a Date
      if (!startTime) throw new Error("No se pudo obtener la fecha del evento");

      const fecha = Timestamp.fromDate(new Date(startTime));
      await updateDoc(solicitudRef, {
        fechaColocacion: fecha,
        localidad: usuario.localidad,
        estado: "turno reservado",
      });
      console.log("documento actualizado");
      setSolicitud((prev) => ({
        ...prev,
        fechaColocacion: fecha,
        localidad: usuario.localidad,
        estado: "turno reservado",
      }));
  
      alert("✅ Reserva guardada en Firestore");
    } catch (error) {
      console.error("❌ Error al guardar en Firestore:", error);
    }
  },[usuario]);
  
  useEffect(() => {
    const handleMessage = (event) => {
      // Verifica origen correctamente
      if (event.origin ==="https://calendly.com") {
        if (event.data.event === "calendly.event_scheduled") {
          console.log("✅ Evento reservado en Calendly:", event.data.payload);
          guardarTurno(event.data.payload); // Función que guarda en Firestore
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage); // Limpieza al desmontar
  }, [guardarTurno]); // Asegurate de que 'usuario' esté disponible cuando se dispare
  

  return isLoading ? (
    <p>Cargando...</p>
  ) : (solicitud?.estado==="inactivo"||usuario.estado==="inactivo")?(
    <>
    <NavBar/>
    <div className="solicitud-container">
      
      <div className="solicitudContainerBody">
        <h2>Solicitar Publicidad</h2>
        <p>
          {solicitudEnviada 
            ? "Gracias por confiar en nosotros. Te avisaremos cuando sea aprobada y te enviaremos la fecha y hora de colocación."

            : "Haz clic en el botón para enviar tu solicitud de publicidad. El administrador la revisará."}
        </p>
        <button className="button-solicitar" onClick={handleSolicitarPublicitar} disabled={loading || solicitudEnviada}>
          {loading ? "Enviando..." : solicitudEnviada ? "Solicitud Enviada" : "Enviar Solicitud"}
        </button>
      </div>
    </div>
    </>
    ):solicitud.estado==="solicitud pendiente"?(
    <>
    <NavBar/>
    <div className="solicitudContainerBody">
      <br/>
      <h2>Turnos disponibles</h2>
      <InlineWidget
            url={eventoUrl}
            styles={{ height: "600px", width: "100%" }}
            pageSettings={{
              hideEventTypeDetails: false,
              hideLandingPageDetails: false,
            }}
      />  
    </div>
    </>
    ):solicitud.estado==="turno reservado"?(
      <>
      <NavBar/>
      <div className="solicitudContainerBody">
      <h2>Reserva: {solicitud.fechaColocacion.toDate().toLocaleString().slice(0,19)}</h2>      
      </div>
      </>
    ):(
      <>
      <NavBar/>
      <div className="solicitudContainerBody">
        <h2>Usuario Activo</h2>
      </div>
      </>
    )
};

export default SolicitudTurno;

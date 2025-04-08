import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { setDoc, doc, getDoc, updateDoc, Timestamp, deleteField } from "firebase/firestore";
import { auth } from "../firebaseConfig";
import { getUserName } from "../auth";
import NavBar from "./navBar";
import Loading from "./Loading";
import { useLocation } from "react-router-dom";

const SolicitudTurno = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [solicitudEnviada, setSolicitudEnviada] = useState(false); // Estado para bloquear envío
  const [isLoading, setIsLoading] = useState(true); // Estado para controlar la carga
  const [solicitud, setSolicitud] = useState(null);
  const [usuario, setUsuario] = useState(null);

  const location = useLocation();
  const id = location.state.id;

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
        fecha: Timestamp.fromDate(new Date()),
        estado: "solicitud pendiente",
        turno: null
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

  const HandelAceptar = async() =>{
    try {
      const solRef = doc(db,"solicitudes",id);
      await updateDoc(solRef,{
        estado:"turno reservado",
        reserva:solicitud.turno,
        turno:deleteField()
      });
      alert("Turno aceptado, lo esperamos");
      const updatedSnap = await getDoc(solRef);
      if (updatedSnap.exists()) {
        setSolicitud(updatedSnap.data());
      }
    } catch (error) {
      console.error("Error al borrar el turno",error);
    }
  }

  const HandleRechazo = async() =>{
    try {
      const solRef = doc(db,"solicitudes",id);
      await updateDoc(solRef,{
        estado:"solicitud pendiente",
        turno:deleteField(),
        reserva:deleteField()
      });
      alert("Turno rechazado, a la brevedad se le sugerirá otro");
      const updatedSnap = await getDoc(solRef);
      if (updatedSnap.exists()) {
        setSolicitud(updatedSnap.data());
      }
    } catch (error) {
      console.error("Error al borrar el turno",error);
    }
  }

  return isLoading ? (
    <Loading/>
  ) : usuario.estado==="inactivo"?(
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
      <h2>No hay turnos disponible aún, se le notificará cuando haya algún turno</h2>
    </div>  
    </>
    ):solicitud.estado==="solicitud contestada"?(
      <>
      <NavBar/>
      <div className="solicitudContainerBody">
        <h2>Horario Sugerido: {solicitud.turno.toDate().toLocaleString().slice(0,19)}</h2>
        <button className="button-user one" onClick={HandelAceptar}>Aceptar</button>
        <button className="button-user two" onClick={HandleRechazo}>Rechazar</button>   
      </div>
      </>
    ):solicitud.estado==="turno reservado"?(
      <>
      <NavBar/>
      <div className="solicitudContainerBody">
        <h2>El usuario {usuario.nombre} {usuario.apellido} tiene reserva para el dia {solicitud.reserva.toDate().toLocaleString().slice(0,19)}</h2>
      </div>
      </>
    ):(
    <>
      <NavBar/>
      <div className="solicitudContainerBody">
        <h2>Usuario Activo</h2>
        <h2>Publicidad desde {usuario.fechaDeInicio.toDate().toLocaleString().slice(0,19)} hasta {usuario.fechaDeVencimiento.toDate().toLocaleString().slice(0,19)}</h2>
      </div>
    </>  
    )
};

export default SolicitudTurno;

import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { setDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { auth } from "../firebaseConfig";
import { getUserName } from "../auth";
import NavBar from "./navBar";

const SolicitudTurno = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [solicitudEnviada, setSolicitudEnviada] = useState(false); // Estado para bloquear envío
  const [isLoading, setIsLoading] = useState(true); // Estado para controlar la carga
  const [solicitud, setSolicitud] = useState(null);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
  
useEffect(() => {
  const verificarSolicitud = async () => {
    const user = auth.currentUser;
    if (!user) {
      setIsLoading(false);
      return;
    }

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
        turnos: [],
        fechaColocacion: null
      };

      await setDoc(solicitudRef, solicitud);
      setSolicitudEnviada(true); // Bloquear el botón después de enviar
      //setMessage("¡Solicitud enviada con éxito! El administrador la revisará.");
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
      setMessage("Hubo un error al enviar la solicitud.");
    } finally {
      setLoading(false);
    }
  };


  const manejarSeleccion = async () =>{
    if (!turnoSeleccionado) {
      alert("Debes seleccionar un turno.");
      return;
    }

    try {
      const user = auth.currentUser;
      const solicitudRef = doc(db, "solicitudes", user.uid);
      await updateDoc(solicitudRef, {
        fechaColocacion: turnoSeleccionado.fecha, // Se usa el objeto completo
        estado: "turno reservado",
      });
      alert("Turno reservado con éxito.");
    } catch (error) {
      console.error("Error al reservar turno:", error);
      alert("Error al reservar turno.");
    }
  }


  return isLoading ? (
    <p>Cargando...</p>
  ) : (
    <>
      <NavBar/>
      <div className="solicitud-container">

        <div className="solicitud">
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
        <br/>
        <h2>Turnos disponibles</h2>
        <div>
          {solicitud?.turnos && !solicitud?.fechaColocacion? (
            <>
              <select
                onChange={(e) => {
                  const index = parseInt(e.target.value, 10);
                  if (!isNaN(index)) {
                    setTurnoSeleccionado(solicitud.turnos[index]); // Guardar objeto turno completo
                  }
                }}
              >
                <option value="">Seleccione un turno</option>
                {solicitud.turnos.map((turno, index) => {
                  if (!turno.fecha || typeof turno.fecha.toDate !== "function") {
                    console.error("Formato de turno incorrecto:", turno);
                    return null;
                  }

                  const fecha = turno.fecha.toDate();
                  const fechaFormateada = fecha.toISOString().split("T")[0];

                  return (
                    <option key={index} value={index}>
                      {fechaFormateada}
                    </option>
                  );
                })}
              </select>

              <button onClick={manejarSeleccion} disabled={solicitud.fechaColocacion}>
                Aceptar
              </button>
            </>
          ) : (
            <p>Aún no hay turnos disponibles o Ya se Reservó un turno</p>
          )}
        </div>
      </div>
    </>
  );
};

export default SolicitudTurno;

/*
import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { db, auth } from "../firebaseConfig";
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const CalendarTurnos = () => {
  const [date, setDate] = useState(new Date());
  const [turnosDisponibles, setTurnosDisponibles] = useState([]);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [turnoConfirmado, setTurnoConfirmado] = useState(false);
  const [turnoReservado, setTurnoReservado] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTurnos = async () => {
      setLoading(true);
      const q = query(collection(db, "turnos"), where("uid", "==", auth.currentUser?.uid));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        const turno = querySnapshot.docs[0].data();
        const turnoId = querySnapshot.docs[0].id;  // Guardamos el ID del documento
        setTurnoReservado({ ...turno, id: turnoId });  // Añadimos el ID a los datos del turno
      } else {
        setTurnoReservado(null);
      }
  
      const fechaStr = date.toISOString().split("T")[0];
      const qTurnosDisponibles = query(collection(db, "turnos"), where("fecha", "==", fechaStr));
      const querySnapshotTurnos = await getDocs(qTurnosDisponibles);
      const turnosReservados = querySnapshotTurnos.docs.map((doc) => doc.data().hora);
  
      const horarios = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];
      const disponibles = horarios.filter((hora) => !turnosReservados.includes(hora));
  
      setTurnosDisponibles(disponibles);
      setLoading(false);
    };
  
    if (auth.currentUser) {
      fetchTurnos();
    }
  }, [date]);
  

  const reservarTurno = async () => {
    if (!auth.currentUser) {
      alert("Debes iniciar sesión para reservar un turno");
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "turnos"), {
        uid: auth.currentUser.uid,
        fecha: date.toISOString().split("T")[0],
        hora: turnoSeleccionado,
        estado: "reservado",
      });

      setTurnoConfirmado(true);
      alert(`Turno confirmado para el ${date.toDateString()} a las ${turnoSeleccionado}`);
      navigate("/user"); // Redirige al usuario después de confirmar el turno
    } catch (error) {
      console.error("Error al reservar turno:", error);
    } finally {
      setLoading(false);
    }
  };

  const cancelarTurno = async () => {
    if (turnoReservado) {
      setLoading(true);
  
      try {
        const turnoRef = doc(db, "turnos", turnoReservado.id);  // Usamos el ID del documento
        await deleteDoc(turnoRef);
        alert("Tu turno ha sido cancelado, ahora puedes realizar una nueva reserva.");
        setTurnoReservado(null);
        setTurnoSeleccionado(null);
      } catch (error) {
        console.error("Error al cancelar turno:", error);
      } finally {
        setLoading(false);
      }
    }
  };
  

  return (
    <div>
      <h2>Selecciona una fecha para reservar turno</h2>
      <Calendar onChange={setDate} value={date} />

      <h3>Turnos disponibles para {date.toDateString()}</h3>
      {loading ? (
        <p>Cargando turnos...</p>
      ) : turnosDisponibles.length > 0 ? (
        turnosDisponibles.map((hora) => (
          <button
            key={hora}
            onClick={() => setTurnoSeleccionado(hora)}
            disabled={turnoReservado} // Deshabilitar botones si ya hay un turno reservado
            style={{
              backgroundColor: turnoSeleccionado === hora ? "#4caf50" : "#008CBA",
              color: "white",
              padding: "10px",
              margin: "5px",
              borderRadius: "5px",
              opacity: turnoReservado ? 0.5 : 1, // Estilo para los botones deshabilitados
            }}
          >
            {hora}
          </button>
        ))
      ) : (
        <p>No hay turnos disponibles para esta fecha.</p>
      )}

      {turnoSeleccionado && <p>Has seleccionado el turno a las {turnoSeleccionado}.</p>}

      {turnoReservado && (
        <div>
          <p>Ya tienes un turno reservado para el {turnoReservado.fecha} a las {turnoReservado.hora}.</p>
          <button
            onClick={cancelarTurno}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "#f44336",
              color: "white",
              borderRadius: "5px"
            }}
          >
            {loading ? (
              <span className="spinner"></span> // Agrega tu spinner aquí
            ) : (
              "Cancelar Turno"
            )}
          </button>
        </div>
      )}

      {turnoSeleccionado && !turnoConfirmado && !turnoReservado && (
        <button
          onClick={reservarTurno}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            backgroundColor: "#4caf50",
            color: "white",
            borderRadius: "5px"
          }}
        >
          {loading ? (
            <span className="spinner"></span> // Agrega tu spinner aquí
          ) : (
            "Confirmar Turno"
          )}
        </button>
      )}
    </div>
  );
};

export default CalendarTurnos;
*/

import { doc, getDoc, updateDoc} from "firebase/firestore";
import React, {   useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import NavBar from "./navBar";
import { useLocation } from "react-router-dom";
import Loading from "./Loading";
import { Timestamp } from "firebase/firestore";
import Swal from "sweetalert2";
import { HandleChangeFecha } from "./handleChangeFecha";

const UserDetails = () =>{
    const [user, setUser] = useState(null);  
    const [loading, setLoading] = useState(true); // nuevo estado
    const [nuevoTurno, setNuevoTurno] = useState(null);
    const [solicitud, setSolicitud] = useState(null);
    const location = useLocation();
    const id = location.state?.id;   

    useEffect(() => {
        const fetchUser = async () => {
          try {
            const userRef = doc(db, "usuarios", id);
            const solRef = doc(db,"solicitudes",id);
            const userSnap = await getDoc(userRef);
            const solSnap  = await getDoc(solRef);
            if (userSnap.exists()) {
              setUser(userSnap.data());
              setSolicitud(solSnap.data());
            } else {
              console.log("No existe el usuario");
            }
          } catch (error) {
            console.error("Error al obtener el usuario:", error);
          } finally {
            setLoading(false);
          }
        };
      
        if (id) {
          fetchUser();
        } else {
          setLoading(false);
        }
      }, [id]);
      

    const imageUser =  localStorage.getItem(`uploadedImage_${user?.email}`);


    const HandleTurno = async (fecha) => {
        try {
          const confirmed = await Swal.fire({
                title: "Guardar Turno?",
                text: "Esta acción no se puede deshacer.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Sí, guardar",
                cancelButtonText: "Cancelar",
          });
          if (!confirmed.isConfirmed) return;
          Swal.fire({
            title: "Guardando turno...",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
          });
          const solicitudRef = doc(db, "solicitudes", id);
          await updateDoc(solicitudRef, {
            estado: "solicitud contestada",
            turno: Timestamp.fromDate(fecha),
            reserva:null
          });
          Swal.fire("Turno guardado", "", "success");
        } catch (error) {
          console.error("Error al guardar el turno", error);
        }
      };


      const HandleFechas = async (e, campo) => {
        const nuevoUser = await HandleChangeFecha(id, campo, e.target.value);
        if (nuevoUser) setUser(nuevoUser);
      };
    
    if (loading) return <Loading/>;
    if (!user) return <p>Cargando usuario...</p>

    return (
      <div>
        <NavBar />
        <h2>Detalles del Usuario</h2>
        <form className="formContainer">
          <label>Nombre:</label>
          <input type="text" defaultValue={user.nombre} />
          <label>Apellido:</label>
          <input type="text" defaultValue={user.apellido} />
          <label>Email:</label>
          <input type="email" defaultValue={user.email} />
          <label>Licencia:</label>
          <input type="number" defaultValue={user.licencia} />
          <label>Marca de auto:</label>
          <input type="text" defaultValue={user.marcaAuto} />
          <label>Modelo de Auto:</label>
          <input type="text" defaultValue={user.modeloAuto} />
          <label>Teléfono:</label>
          <input type="text" defaultValue={user.telefono} />
          {user.estado==="activo"? (
            <div>
              <label>Fecha de Inicio:</label>
              <input 
                type="date"
                defaultValue={user.fechaDeInicio.toDate().toISOString().split("T")[0]}
                onChange={(e) => HandleFechas(e, "fechaDeInicio")}            
              />
              <label>Fecha de Vencimiento:</label>
              <input 
                type="date"
                defaultValue={user.fechaDeVencimiento.toDate().toISOString().split("T")[0]}
                onChange={(e) => HandleFechas(e, "fechaDeVencimiento")}                 
              />
            </div>
          ):(
            <p>El usuario aún no tiene publicidad activa</p>
          )}
        </form>
          <div className="vehicleSection">
            <h4>Foto del vehículo:</h4>
            {imageUser ? (
              <img src={imageUser} alt="Foto del vehículo" className="userCarImage" />
            ) : (
              <p>No hay imagen cargada</p>
            )}
          </div>
  
          <div className="turnoSection">
            {!solicitud ? (
              <p>
                El usuario {user.nombre} {user.apellido} no realizó una solicitud
              </p>
            ) : !solicitud.turno  && !solicitud.reserva?(
              <div>
                <label>Turno para {user.nombre} {user.apellido}</label>
                <input
                  className="turnoInput"
                  type="datetime-local"
                  name="turno"
                  onChange={(e) => setNuevoTurno(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (nuevoTurno) {
                      const fecha = new Date(nuevoTurno);
                      if (!isNaN(fecha)) {
                        HandleTurno(fecha);
                      } else {
                        alert("Fecha inválida");
                      }
                    } else {
                      alert("Por favor seleccione fecha y hora.");
                    }
                  }}
                >
                  Guardar turno
                </button>
              </div>
            ) : !solicitud.reserva ? (
              <p>
                El usuario {user.nombre} {user.apellido} debe aceptar o rechazar
                el turno del día{" "}
                {solicitud.turno.toDate().toLocaleString("es-AR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                .
              </p>
            ) : user.estado!=="activo"?(
              <p>
                El usuario {user.nombre} {user.apellido} tiene turno para{" "}
                {solicitud.reserva.toDate().toLocaleString("es-AR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            ):(
            <p> El usuario {user.nombre} {user.apellido} tiene publicidad activa desde 
              {user.fechaDeInicio.toDate().toLocaleString("es-AR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
              })} hasta 
              {user.fechaDeVencimiento.toDate().toLocaleString("es-AR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
            </p>)}
          </div>
      </div>
    );
  };

export default UserDetails;
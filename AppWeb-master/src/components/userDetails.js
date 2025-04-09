import { doc, getDoc, updateDoc} from "firebase/firestore";
import React, {   useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import NavBar from "./navBar";
import { useLocation } from "react-router-dom";
import Loading from "./Loading";
import { Timestamp } from "firebase/firestore";

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


    const HandleChange = async (fecha) => {
        try {
          const solicitudRef = doc(db, "solicitudes", id);
          await updateDoc(solicitudRef, {
            estado: "solicitud contestada",
            turno: Timestamp.fromDate(fecha),
            reserva:null
          });
          alert("Turno cargado");
        } catch (error) {
          console.error("Error al guardar el turno", error);
        }
      };

    
    if (loading) return <Loading/>;
    if (!user) return <p>Cargando usuario...</p>

    return (
        <div >
            <NavBar />
            <h2>Detalles del Usuario</h2>
            <br/>
            <form className="formContainer">
                <label>Nombre:</label>
                <input type="text" defaultValue={user.nombre} />
                <label>Apellido:</label>
                <input type="text" defaultValue={user.apellido}></input>
                <label>Email:</label>
                <input type="email" defaultValue={user.email} />
                <label>Licencia:</label>
                <input type="number" defaultValue={user.licencia} />
                <label>Marca de auto:</label>
                <input type="text" defaultValue={user.marcaAuto} />
                <label>Modelo de Auto:</label>
                <input type="text" defaultValue={user.modeloAuto} />
                {imageUser ? ( 
                    <img src={imageUser} alt="" className="formContainer"/>
                    ):(
                        <p>No hay imagen cargada</p>
                    )
                }
                {!solicitud?(
                  <p>El usuario {user.nombre} {user.apellido} no realizó una solicitud</p>
                ):solicitud && !solicitud.reserva? (
                    <div>   
                      <label>Turno para {user.nombre} {user.apellido}</label>
                      <input 
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
                              HandleChange(fecha);
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
                ):(
                    <p>
                        El usuario {user.nombre} {user.apellido} tiene turno para{" "}
                        {solicitud.reserva.toDate().toLocaleString("es-AR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                        })}
                    </p>
                )}
            </form>
        </div>
    )
}

export default UserDetails;
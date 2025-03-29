import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import NavBar from "./navBar";
import { useLocation } from "react-router-dom";

const UserDetails = () =>{
    const [user, setUser] = useState(null);  
    const [turnos, setTurnos] = useState([{ id: 1, fecha: "" }]);  
    const [guardando, setGuardando] = useState(false);

    const location = useLocation();
    const id = location.state?.id;

    useEffect(()=>{
    
        console.log("ID recibido en UserDetails:", id);
        const fetchUser = async () =>{
            const userRef =doc(db,"usuarios", id);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()){
                console.log("Documento encontrado",userSnap.data());
                setUser(userSnap.data());
            }else{
                console.log("No existe el usuario");
            }
        };
        if (id){
            fetchUser();
        }
        
    }, [id]);

    const imageUser =  localStorage.getItem(`uploadedImage_${user?.email}`);


    const handleChange = (index, value) => {
        const nuevosTurnos = [...turnos];
        nuevosTurnos[index].fecha = value;
    
        if (index === turnos.length - 1 && value !== "") {
          nuevosTurnos.push({ id: turnos.length + 1, fecha: "" });
        }
    
        setTurnos(nuevosTurnos);
    };
    
    const handleGuardar = async (id) => {
        try {
            setGuardando(true);
    
            const userRef = doc(db, "usuarios", id);
            const turnosValidos = turnos
                .filter((turno) => turno.fecha) // Solo turnos con fecha
                .map((turno) => ({
                    fecha: Timestamp.fromDate(new Date(ajustarFechaBuenosAires(turno.fecha))),
                }));
    
            
            await updateDoc(userRef, { turnos: turnosValidos, estado:"pendiente" });
    
            
            setTurnos([{ id: 1, fecha: "" }]);
    
            alert("Turnos guardados correctamente.");
        } catch (error) {
            console.error("Error al guardar turnos:", error);
        } finally {
            setGuardando(false);
        }
    };
    
    const ajustarFechaBuenosAires = (fechaStr) => {
        const fecha = new Date(fechaStr);
        fecha.setUTCHours(3, 0, 0, 0); // Ajustar a medianoche en Buenos Aires (UTC-3)
        return fecha;
      };


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
                
            </form>
            <div className="formContainer">
                <h2>Gestión de Turnos</h2>
                {turnos.map((turno, index) => (
                    <div key={index} style={{ marginBottom: "10px" }}>
                        <label>Turno {turno.id}:</label>
                        <input
                            type="date"
                            name="fecha"
                            value={turnos[user.id]?.fecha? 
                                turnos[user.id].fecha.toDate().toISOString().split("T")[0] : ""}
                            onChange={(e) => handleChange(index, e.target.value)}
                            disabled={user.turnos}
                        />
                    </div>
                    
                ))}
                <button onClick={()=>handleGuardar(id)} disabled={guardando}>{guardando ? "Guardando..." : "Guardar Turnos"}</button>
                
            </div>
        </div>
    )
}

export default UserDetails;
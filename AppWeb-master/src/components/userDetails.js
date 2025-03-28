import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import NavBar from "./navBar";
import { useLocation } from "react-router-dom";

const UserDetails = () =>{
    const [user, setUser] = useState(null);    
    
    const location = useLocation();
    const id = location.state.id;

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
            
        </div>
    )
}

export default UserDetails;
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { db } from "../firebaseConfig";
import UploadImage from "./uploadImage";
import NavBar from "./navBar";
import { Link } from "react-router-dom";

const UserDetails = () =>{
    const [user, setUser] = useState(null);
    const location = useLocation();
    const id = location.state.id;

    useEffect(()=>{
        const fetchUser = async () =>{
            const userRef =doc(db,"usuarios", id);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()){
                setUser(userSnap.data());
            }else{
                console.log("No existe el usuario");
            }
        };
        fetchUser();
    }, [id]);

    if (!user) return <p>Cargando usuario...</p>

    return (
        <div >
            <NavBar />
            <Link to={`/user`}>Volver</Link>
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
            </form>
            <UploadImage user={user}/>
        </div>
    )
}

export default UserDetails;
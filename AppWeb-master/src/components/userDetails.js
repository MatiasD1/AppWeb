import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebaseConfig";

const UserDetails = () =>{
    const {id} = useParams();
    const [user, setUser] = useState(null);

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
            <h2>Detalles de {user.nombre} {user.apellido}</h2>
            <br/>
            <form className="formContainer">
                <label>Nombre:</label>
                <input type="text" defaultValue={user.nombre} />
                <label>Apellido:</label>
                <input type="text" defaultValue={user.apellido}></input>
                <label>Email:</label>
                <input type="email" defaultValue={user.email} />
            </form>
        </div>
    )
}

export default UserDetails;
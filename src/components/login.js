import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authenticateUser } from "../auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import AuthForm from "./authForm"; // Importa el componente reutilizable
import { auth } from "../firebaseConfig";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const user = await authenticateUser(email, password);
      if (!user?.uid) {
        console.error("❌ Usuario no autenticado");
        return;
      }
  
      const userDoc = await getDoc(doc(db, "usuarios", user.uid));
      if (!userDoc.exists()) {
        console.error("❌ Usuario no encontrado en Firestore");
        return;
      }
  
      const role = userDoc.data().role || "user";
      navigate(role === "admin" ? "/admin" : "/user");
      console.log("Usuario autenticado y redirigido:", auth.currentUser);
  
    } catch (error) {
      console.error("❌ Error al iniciar sesión:", error);
    }
  };
  

  // Definir los campos para AuthForm
  const fields = [
    { 
      name: "email", 
      label: "Correo electrónico", 
      type: "email", 
      value: email, 
      setValue: setEmail 
    },
    { 
      name: "password", 
      label: "Contraseña", 
      type: "password", 
      value: password, 
      setValue: setPassword 
    }
  ];

  return (
    <div className="login">
      <AuthForm
        title="Iniciar sesión"
        buttonText="Iniciar sesión"
        handleSubmit={handleLogin}
        fields={fields}  // Pasar los campos aquí
      />
    </div>
  );
};

export default Login;

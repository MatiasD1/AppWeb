import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authenticateUser } from "../auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import AuthForm from "./authForm"; // Importa el componente reutilizable
import { auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState(""); // Valores que ingresa el usuario
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // Hook para redirigir tras la autenticación

  useEffect(() => {
    // 🔹 Comprueba si hay un usuario autenticado al cargar la página
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("🔹 Sesión activa detectada:", user.uid);

        // Obtiene el rol del usuario desde Firestore
        const userDoc = await getDoc(doc(db, "usuarios", user.uid));
        if (userDoc.exists()) {
          const role = userDoc.data().role || "user";
          navigate(role === "admin" ? "/admin" : "/user"); // 🔹 Redirige según el rol
        }
      }
    });

    return () => unsubscribe(); // 🔹 Limpia el listener al desmontar
  }, [navigate]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    }
  };
  const handleLogin = async (e) => { // Funcion cuando se envia el formulario
    e.preventDefault();
    try {
      const user = await authenticateUser(email, password); // Llama a la función de auth.js para autenticar al usuario con las credenciales ingresadas y si lo encuentra, almacena los datos de authentication en user
      if (!user?.uid) {
        console.error("❌ Usuario no autenticado");
        return;
      }
  
      const userDoc = await getDoc(doc(db, "usuarios", user.uid)); // Almacena los datos del usuario de la base de datos de firestore
      if (!userDoc.exists()) {
        console.error("❌ Usuario no encontrado en Firestore");
        return;
      }
  
      const role = userDoc.data().role || "user"; // userDoc.data() devuelve un objeto con la info de la bdd del usuario y el rol (si tiene, sino le asigna "user" por defecto)
      navigate(role === "admin" ? "/admin" : "/user"); // Navega a la ruta correspondiente dependiendo del rol
      console.log("Usuario autenticado y redirigido:", auth.currentUser);
  
    } catch (error) {
      console.error("❌ Error al iniciar sesión:", error);
    }
  };
  

  // Define los 2 campos para enviar a AuthForm 
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
  fields={fields}
  handleChange={handleChange}  // Ensure this is passed down properly
  showSubmitButton={true} // Se mostrará el botón de submit
>
  <div>No Estás registrado? <Link to={`/register`}>Registrate Aquí</Link></div>
</AuthForm>
    </div>
  );
};

export default Login;


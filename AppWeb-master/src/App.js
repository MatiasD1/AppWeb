// App.js
import './CSS/main.css';
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { auth, db } from "./firebaseConfig";
import { getDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Login from "./components/login";
import Register from "./components/register";
import Admin from "./components/admin"; // Asegúrate de tener este componente
import User from "./components/user"; // Asegúrate de tener este componente
import Footer from "./components/footer"; // Asegúrate de importar el Footer
import Turnos from './components/turnos';
import UserDetails from './components/userDetails';
import Publicidad from './components/publicidad';
import NoAceptados from './components/noAceptados';
import UploadImage from './components/uploadImage';

function App() {

  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true); // Para controlar la carga de la autenticacion

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "usuarios", user.uid));
        const role = userDoc.exists() ? userDoc.data().role : null;
        setUserRole(role);

      } else {
        setUserRole(null);
      }
      setLoading(false); // La carga terminó
    });

    return () => unsubscribe();
  }, []);

  if (loading) { // Controla si se cargó la autenticación para que no muestre /login mientras carga 
    return null; // Podria mostrar un spinner de carga 
  }
  
  return (
    <Router>
      <div className="page-container"> 
        <Routes>
          <Route path="/" element={userRole ? <Navigate to={`/${userRole}`} /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={userRole === "admin" ? <Admin /> : <Navigate to="/" />} />
          <Route path="/user" element={userRole === "user" ? <User /> : <Navigate to="/" />} />
          <Route path="/turnos" element={<Turnos />} />
          <Route path="/userDetails/:id" element={<UserDetails/>}/>
          <Route path="/publicidad" element={<Publicidad/>}/>
          <Route path="/noAceptados" element={<NoAceptados/>}/>
          <Route path="/uploadImage" element={<UploadImage/>}/>
        </Routes>
        <Footer />
      </div>
    </Router>   
  );
}

export default App;

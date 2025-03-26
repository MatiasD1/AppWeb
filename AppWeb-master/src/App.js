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
import UserDetails from './components/userDetails';
import Publicidad from './components/publicidad';
import { UserProvider } from './userContext';
import SolicitudTurno from './components/solicitudTurno';
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
    <UserProvider>
      <Router>
        <div className="page-container"> 
          <Routes>
            {/* Rutas generales */}
            <Route path="/" element={userRole ? <Navigate to={`/${userRole}`} /> : <Navigate to="/login" />} />
            <Route path="/login" element={userRole ? <Navigate to={`/${userRole}`} /> : <Login />} />
            <Route path="/register" element={userRole ? <Navigate to={`/${userRole}`} /> : <Register />} />
            
            {/* Rutas solo para user */}
            <Route path="/user" element={userRole === "user" ? <User /> : <Navigate to="/" />} />
            <Route path="/solicitudTurno" element={userRole === "user" ? <SolicitudTurno /> : <Navigate to="/" />} />
            <Route path="/uploadImage" element={userRole === "user" ? <UploadImage /> : <Navigate to="/" />} />

            {/* Rutas solo para admin */}
            <Route path="/admin" element={userRole === "admin" ? <Admin /> : <Navigate to="/" />} />
            <Route path="/userDetails/:id" element={userRole === "admin" ? <UserDetails /> : <Navigate to="/" />} />
            <Route path="/userDetails" element={userRole === "admin" ? <UserDetails /> : <Navigate to="/" />} />
            <Route path="/publicidad" element={userRole === "admin" ? <Publicidad /> : <Navigate to="/" />} />
            <Route path="/noAceptados" element={userRole === "admin" ? <NoAceptados /> : <Navigate to="/" />} />
          </Routes>
          <Footer />
        </div>
      </Router>   
    </UserProvider>
  );
}

export default App;

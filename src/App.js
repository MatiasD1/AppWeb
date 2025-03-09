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

function App() {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "usuarios", user.uid));
        const role = userDoc.exists() ? userDoc.data().role : null;
        setUserRole(role);
      } else {
        setUserRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={userRole ? <Navigate to={`/${userRole}`} /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={userRole === "admin" ? <Admin /> : <Navigate to="/" />} />
        <Route path="/user" element={userRole === "user" ? <User /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;

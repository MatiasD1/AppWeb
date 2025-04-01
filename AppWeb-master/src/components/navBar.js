import React, { useState, useEffect } from "react";
import LogoutButton from "./logout";
import logo from "../img/wolfLogo.png"; // Ajusta la ruta del logo según tu estructura
import { useUser } from "../userContext";
import { useNavigate } from "react-router-dom";

const NavBar = () => {
  const userName = useUser();
  const [loading, setLoading] = useState(true); // Estado para manejar la carga
  const navigate = useNavigate();
  
  useEffect(() => {
    if (userName) {
      setLoading(false); // Si el nombre de usuario está disponible, ya no está cargando
    }
  }, [userName]);

  if (loading) {
    return (
      <nav className="navbar">
        {/* Logo alineado a la izquierda */}
        <img src={logo} alt="Company Logo" className="logo" onClick={() => navigate("/")}/>

        {/* Indicador de carga mientras obtenemos los datos del usuario */}
        <div className="nav-right">
          <span>Cargando...</span> {/* Aquí puedes usar un spinner o un mensaje de carga */}
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      {/* Logo alineado a la izquierda */}
      <img src={logo} alt="Company Logo" className="logo" onClick={() => navigate("/")}/>

      {/* Sección derecha con userName y botón de logout */}
      <div className="nav-right">
        {userName && (
          <span className="user-name">
            {userName ? `${userName.nombre} ${userName.apellido}` : "Invitado"}
          </span>
        )}
        <LogoutButton className="logout-btn" />
      </div>
    </nav>
  );
};

export default NavBar;

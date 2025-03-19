import React from "react";
import LogoutButton from "./logout";
import logo from "../img/wolfLogo.png"; // Ajusta la ruta del logo según tu estructura

const NavBar = ({ userName }) => {
  console.log("🛠 userName en NavBar:", userName);
  return (
    <nav className="navbar">
      {/* Logo alineado a la izquierda */}
      <img src={logo} alt="Company Logo" className="logo" />

      {/* Sección derecha con userName y botón de logout */}
      <div className="nav-right">
        {userName && <span className="user-name">{userName ? `${userName.nombre} ${userName.apellido}` : "Invitado"}</span>}
        <LogoutButton className="logout-btn" />
      </div>
    </nav>
  );
};

export default NavBar;

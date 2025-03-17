import React from "react";
import LogoutButton from "./logout";

const NavBar = ({ companyName, userName }) => {
  return (
    <nav className="navbar">
      <h1>{companyName}</h1>
      {/* Mostrar el nombre del usuario si está disponible */}
      {userName && <span>{userName}</span>}
      <LogoutButton className="logout-btn" />
    </nav>
  );
};

export default NavBar;

import React from "react";
import { logoutUser } from "../auth"; // Importa la función

const LogoutButton = () => {
const handleLogout = async () => {
    await logoutUser();
};

    return <button className="logout-btn" onClick={handleLogout}>Cerrar Sesión</button>;
};

export default LogoutButton;

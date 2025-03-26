import React from "react";
import { logoutUser } from "../auth"; // Importa la función
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {

    const navigate = useNavigate();

    const handleLogout = async () => {
        await logoutUser();
        navigate("/login");
    };

        return (
            <button className="logout-btn" onClick={handleLogout}>
                Cerrar Sesión
            </button>
        );
    };

export default LogoutButton;

import NavBar from "./navBar";
import Carrusel from "./Carrusel";
import { useNavigate } from "react-router-dom";


const User = () => {
  
  const navigate = useNavigate();

  return (
    <div className="user-container">
      <NavBar />
      <div className="content">
        <Carrusel />
        <div className="button-group">
          <button className="button-user one" onClick={() => navigate("/solicitudTurno")}>
            Pedir Turno
          </button>
          <button className="button-user two" onClick={() => navigate("/subirFoto")}>
            Subir Foto
          </button>
        </div>
      </div>
    </div>
  );
};

export default User;

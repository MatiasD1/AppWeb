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
          <button className="button-user one" onClick={() => alert("Ir a publicidad")}>
            Contratar Publicidad
          </button>
          <button className="button-user two" onClick={() => navigate("/solicitar-publicidad")}>
            Pedir Turno
          </button>
        </div>
      </div>
    </div>
  );
};

export default User;

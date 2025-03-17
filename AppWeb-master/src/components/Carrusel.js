import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap"; // ✅ Importa Bootstrap completo (CSS + JS)
import Carrusel1 from "../img/Carrusel1.jpg";
import Carrusel2 from "../img/Carrusel2.jpg";
import Carrusel3 from "../img/Carrusel3.jpg";

const Carrusel = () => {
  useEffect(() => {
    const bootstrap = require("bootstrap"); // ✅ Importa Bootstrap dinámicamente
    new bootstrap.Carousel("#carouselExampleAutoplaying", {
      interval: 4000,
      ride: "carousel",
    });
  }, []);

  return (
    <div className="carrusel">
      <div id="carouselExampleAutoplaying" className="carousel slide">
        <div className="carousel-inner">
          <div className="carousel-item active">
            <img src={Carrusel1} className="d-block w-100 img-carrusel" alt="Foto del exterior" />
            <p className="textoCarruselInicio">Texto1</p>
          </div>
          <div className="carousel-item">
            <img src={Carrusel2} className="d-block w-100 img-carrusel" alt="Foto de la pieza" />
            <p className="textoCarruselInicio">Texto2</p>
          </div>
          <div className="carousel-item">
            <img src={Carrusel3} className="d-block w-100 img-carrusel" alt="Foto de la sala" />
            <p className="textoCarruselInicio">Texto3</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Carrusel;

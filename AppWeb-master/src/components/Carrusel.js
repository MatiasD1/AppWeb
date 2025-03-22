import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import Carrusel1 from "../img/Carrusel1.jpg";
import Carrusel2 from "../img/Carrusel2.jpg";
import Carrusel3 from "../img/Carrusel3.jpg";

const Carrusel = () => {
  useEffect(() => {
    const bootstrap = require("bootstrap");
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
            <p className="textoCarruselInicio">¿Listo para ganar más con cada viaje?</p>
          </div>
          <div className="carousel-item">
            <img src={Carrusel2} className="d-block w-100 img-carrusel" alt="Foto de la pieza" />
            <p className="textoCarruselInicio">Convertí tu taxi en un espacio publicitario</p>
          </div>
          <div className="carousel-item">
            <img src={Carrusel3} className="d-block w-100 img-carrusel" alt="Foto de la sala" />
            <p className="textoCarruselInicio">Y pedí un turno para colocar la calcomanía</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Carrusel;

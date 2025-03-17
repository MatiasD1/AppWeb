// components/Footer.js
import React from "react";

const Footer = () => {
  return (
    <div className="page-container">
      <footer className="footer">
        <p className="copyright">
          © {new Date().getFullYear()} Nombre de la Empresa. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
};

export default Footer;

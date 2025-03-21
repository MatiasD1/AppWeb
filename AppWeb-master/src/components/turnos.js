import React from 'react';
import { Link } from 'react-router-dom';

const Turnos = () => {
  return (
    <div className="turnos">
      <h1>Bienvenido a Turnos</h1>
      <p>Explora nuestro contenido y descubre todo lo que tenemos para ti.</p>
      <button className="btn">Empezar</button>
      <Link className='btn' to={`/user`}>Volver</Link>
    </div>
  );
};

export default Turnos;

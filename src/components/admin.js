// Admin.js
import React from 'react';
import LogoutButton from './logout';

const Admin = () => {
  return (
    <div>
      <h2>Bienvenido, Administrador</h2>
      <p>Aquí puedes gestionar el contenido y los usuarios de la aplicación.</p>
      <LogoutButton/>
    </div>
  );
};

export default Admin;


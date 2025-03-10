// Admin.js
import React from 'react';
import LogoutButton from './logout';

const Admin = () => {
  return (
    <div>
      <h2>Bienvenido, Administrador</h2>
      <p>Texto para poner cosas random relacionadas con el admin.</p>
      <LogoutButton/>
    </div>
  );
};

export default Admin;


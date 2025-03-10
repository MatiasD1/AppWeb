// User.js
import React from 'react';
import LogoutButton from './logout';

const User = () => {
  return (
    <div>
      <h2>Bienvenido, Usuario</h2>
      <p>Texto para poner cosas random relacionadas con el usuario</p>
      <LogoutButton/>
    </div>
  );
};

export default User;

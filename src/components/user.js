// User.js
import React from 'react';
import LogoutButton from './logout';

const User = () => {
  return (
    <div>
      <h2>Bienvenido, Usuario</h2>
      <p>Aquí puedes ver tu contenido personal, como tus pedidos, perfil, etc.</p>
      <LogoutButton/>
    </div>
  );
};

export default User;

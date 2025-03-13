// Header.js
import React from "react";

const Header = ({ userName, message }) => {
  return (
    <header className="bg-blue-600 text-white p-4 text-center">
      <h1 className="text-2xl font-bold">
        Bienvenido, {userName}!
      </h1>
      <p className="text-lg mt-2">
        {message}
      </p>
    </header>
  );
};

export default Header;

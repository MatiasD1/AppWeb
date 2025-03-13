import React, { useState, useEffect } from 'react';
import { auth } from '../firebaseConfig';
import { getUserName } from '../auth'; // Importa la función para obtener el nombre
import LogoutButton from './logout';
import Header from './header';
import { onAuthStateChanged } from 'firebase/auth'; // Para escuchar el cambio de autenticación

const Admin = () => {
  const [userName, setUserName] = useState(null); // Estado para almacenar el nombre del usuario

  useEffect(() => {
    // Escuchar los cambios de autenticación
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const name = await getUserName(user.uid); // Obtiene el nombre del usuario
        setUserName(name); // Almacena el nombre en el estado
      } else {
        setUserName(null); // Si no hay usuario, establece el nombre como null
      }
    });

    return () => unsubscribe(); // Limpiar el suscriptor al desmontar el componente
  }, []);

  return (
    <div>
      <LogoutButton />
      {userName && <Header userName={userName} />} {/* Solo renderiza Header si userName está disponible */}
    </div>
  );
};

export default Admin;

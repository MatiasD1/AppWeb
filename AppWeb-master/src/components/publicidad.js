import React from 'react'
import UserDetails from './userDetails';
import { useLocation } from 'react-router-dom';

const Publicidad = () => {


  const location = useLocation();
  const id = location.state?.id || "Sin ID";
  console.log(id);

  return (
    <div>
        <UserDetails id={id}/>
    </div>
  );
};

export default Publicidad;

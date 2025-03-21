import React from 'react'
import { Link } from 'react-router-dom';
import UserDetails from './userDetails';

const Publicidad = () => {

  return (
    <div>
      <Link to={`/user`}>Volver</Link>
      <UserDetails/>
    </div>
  )
}

export default Publicidad;

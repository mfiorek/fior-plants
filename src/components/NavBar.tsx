import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthAPI from '../api/AuthAPI';

const NavBar: React.FC = () => {
  const location = useLocation();

  return (
    <div className='navbar sticky top-0 left-0 z-50 justify-between bg-teal-900'>
      {location.pathname === '/' ? (
        <p className='mx-3 select-none text-2xl'>fior-plants 🪴</p>
      ) : (
        <Link to={'/'} className='btn btn-ghost text-xl normal-case' >
          fior-plants 🪴
        </Link>
      )}
      <button className='btn btn-ghost text-xl normal-case' onClick={AuthAPI.logout}>
        Log out
      </button>
    </div>
  );
};

export default NavBar;

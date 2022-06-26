import React from 'react';
import AuthAPI from '../api/AuthAPI';

const NavBar: React.FC = () => {
  return (
    <div className='sticky top-0 left-0 z-50 navbar bg-teal-900 justify-between'>
      <p className='text-2xl mx-3 select-none'>fior-plants 🪴</p>
      <button className='btn btn-ghost normal-case text-xl' onClick={AuthAPI.logout}>
        Log out
      </button>
    </div>
  );
};

export default NavBar;
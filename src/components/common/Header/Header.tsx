import React, { useContext } from 'react';
import { Link, redirect } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext.tsx';

const Header: React.FC = () => {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  const { auth } = authContext;

  return (
    <header className='flex text-white bg-[#292929] justify-between items-center p-3 border-b-[1px] border-sky-600'>
      <h1 className='font-medium text-4xl'>
        <Link className='text-white' to='/'>
          MingleFlix
        </Link>
      </h1>
      <nav>
        <Link to='/about' className='mr-[10px] text-white'>
          About
        </Link>
        {/*<a href="/contact" style={{ color: 'white', textDecoration: 'none', margin: '0 10px' }}>Contact</a>*/}
        {!auth?.token ? (
          <Link to='/login' className='mr-[10px] text-white'>
            Login
          </Link>
        ) : (
          <a
            onClick={() => {
              authContext.logout;
              redirect('/');
            }}
            className='mr-[10px] text-white'
          >
            Logout
          </a>
        )}
        <Link to='/register' className='mr-[10px] text-white'>
          Register
        </Link>
      </nav>
    </header>
  );
};

export default Header;

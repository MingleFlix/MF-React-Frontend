import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext.tsx';

const Header: React.FC = () => {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate(); // Add this line

  if (!authContext) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  const { auth } = authContext;

  return (
    <header className='flex w-full text-white bg-[#292929] justify-between items-center p-3 border-b-[1px] border-sky-600'>
      <h1 className='font-medium text-4xl'>
        <Link className='text-white' to='/'>
          MingleFlix
        </Link>
      </h1>
      <nav>
        <Link to='/' className='mr-[10px] text-white'>
          Home
        </Link>
        {/*<a href="/contact" style={{ color: 'white', textDecoration: 'none', margin: '0 10px' }}>Contact</a>*/}
        {!auth?.token ? (
          <>
            <Link to='/login' className='mr-[10px] text-white'>
              Login
            </Link>
            <Link to='/register' className='mr-[10px] text-white'>
              Register
            </Link>
          </>
        ) : (
          <>
            <Link to={`/user/${auth.userId}`} className='mr-[10px] text-white'>
              Profile
            </Link>
            <a
              onClick={() => {
                authContext.logout();
                navigate('/');
              }}
              className='mr-[10px] text-white'
            >
              Logout
            </a>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;

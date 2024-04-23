import React from 'react';

const Header: React.FC = () => {
  return (
    <header className='flex text-white bg-[#292929] justify-between items-center p-3 border-b-[1px] border-sky-600'>
      <h1 className='font-medium text-4xl'>
        <a className='text-white' href='/'>
          MingleFlix
        </a>
      </h1>
      <nav>
        <a href='/about' className='mr-[10px] text-white'>
          About
        </a>
        {/*<a href="/contact" style={{ color: 'white', textDecoration: 'none', margin: '0 10px' }}>Contact</a>*/}
        <a href='/login' className='mr-[10px] text-white'>
          Login
        </a>
        <a href='/register' className='mr-[10px] text-white'>
          Register
        </a>
      </nav>
    </header>
  );
};

export default Header;

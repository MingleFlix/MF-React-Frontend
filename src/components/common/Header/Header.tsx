import React from 'react';

const Header: React.FC = () => {
  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '10px 50px',
        alignItems: 'center',
        backgroundColor: '#282c34',
        color: 'white',
      }}
    >
      <h1>MingleFlix</h1>
      <nav>
        <a
          href='/about'
          style={{ color: 'white', textDecoration: 'none', margin: '0 10px' }}
        >
          About
        </a>
        {/*<a href="/contact" style={{ color: 'white', textDecoration: 'none', margin: '0 10px' }}>Contact</a>*/}
        <a
          href='/login'
          style={{ color: 'white', textDecoration: 'none', margin: '0 10px' }}
        >
          Login
        </a>
        <a
          href='/register'
          style={{ color: 'white', textDecoration: 'none', margin: '0 10px' }}
        >
          Register
        </a>
      </nav>
    </header>
  );
};

export default Header;

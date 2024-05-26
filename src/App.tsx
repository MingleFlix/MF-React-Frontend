import './App.css';
import { Outlet } from 'react-router-dom';
import Header from './components/common/Header/Header.tsx';
import { AuthProvider } from '@/context/AuthContext.tsx';

function App() {
  return (
    <AuthProvider>
      <Header />
      <Outlet />
    </AuthProvider>
  );
}

export default App;

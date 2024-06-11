// src/context/AuthContext.tsx
import { createContext, FC, ReactNode, useEffect, useState } from 'react';
import Cookies from 'js-cookie';

interface AuthContextType {
  auth: { token: string; role: string } | null;
  login: (token: string, role: string, expireDate: Date) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [auth, setAuth] = useState<{ token: string; role: string } | null>(
    null,
  );

  useEffect(() => {
    const token = Cookies.get('auth_token');
    const role = Cookies.get('auth_role');
    console.log(token, role);
    if (token && role) {
      setAuth({ token, role });
    }
  }, []);

  const login = (token: string, role: string) => {
    Cookies.set('auth_token', token);
    Cookies.set('auth_role', role);
    setAuth({ token, role });
  };

  const logout = () => {
    Cookies.remove('auth_token');
    Cookies.remove('auth_role');
    setAuth(null);
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

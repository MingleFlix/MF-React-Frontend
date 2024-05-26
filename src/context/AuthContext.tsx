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
    if (token && role) {
      setAuth({ token, role });
    }
  }, []);

  const login = (token: string, role: string, expireDate: Date) => {
    // Save into cookie
    Cookies.set('authtoken', token, {
      expires: expireDate,
      secure: false, // For now insecure
    });

    setAuth({ token, role });
  };

  const logout = () => {
    Cookies.remove('authtoken');
    setAuth(null);
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

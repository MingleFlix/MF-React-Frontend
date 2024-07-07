// src/context/AuthContext.tsx
import { createContext, FC, ReactNode, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

/*
 * Author: Jesse Günzl
 * Matrikelnummer: 2577166
 */

interface AuthContextType {
  auth: AuthData | null;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
}

interface AuthData {
  token: string;
  username: string;
  userId: string;
  email: string;
}

interface AuthResponseData {
  email: string;
  exp: number;
  iat: number;
  userId: string;
  username: string;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [auth, setAuth] = useState<AuthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('auth_token');

    if (token) {
      extractAndSetAuth(token);
    }
    setLoading(false);
  }, []);

  function extractAndSetAuth(token: string) {
    try {
      // Throws InvalidTokenError, this way we check if it is even a valid token
      const decodedToken = decodeToken(token);
      const { email, userId, username } = decodedToken;

      if (checkExpiration(decodedToken.exp)) {
        console.error('Token expired');
        setAuth(null);
        return;
      }

      setAuth({ token, userId, email, username });
    } catch (error) {
      console.error('Invalid token');
      setAuth(null);
    }
  }

  const login = (token: string) => {
    Cookies.set('auth_token', token);

    extractAndSetAuth(token);
  };

  const logout = () => {
    Cookies.remove('auth_token');
    setAuth(null);
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const decodeToken = (token: string) => {
  try {
    return jwtDecode(token) as AuthResponseData;
  } catch (error) {
    return null;
  }
};

const checkExpiration = (exp: number) => {
  return Date.now() >= exp * 1000;
};

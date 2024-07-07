import { ReactNode, useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext.tsx';

/*
 * Author: Jesse Günzl
 * Matrikelnummer: 2577166
 */

export function ProtectedRoute({ children }: { children?: ReactNode }) {
  const { auth, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!auth) {
    return <Navigate to={'/login'} replace />;
  }

  return children ? children : <Outlet />;
}

import { createBrowserRouter } from 'react-router-dom';
import Root from '@/routes/root.tsx';
import ErrorPage from '@/error-page.tsx';
import { HomePage } from '@/pages/HomePage.tsx';
import { Login } from '@/pages/Login.tsx';
import { Register } from '@/pages/Register.tsx';
import RoomPage from '@/pages/Room/RoomPage.tsx';
import { roomLoader } from '@/pages/Room/RoomLoader.ts';
import Dev from '@/pages/Dev.tsx';
import { ProtectedRoute } from '@/components/common/ProtectedRoute/ProtectedRoute.tsx';
import { userLoader } from '@/pages/User/UserLoader.ts';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'room/:roomId',
        // element: <RoomPage />,
        element: <ProtectedRoute children={<RoomPage />} />,
        loader: roomLoader,
      },
      {
        path: 'dev',
        element: <Dev />,
      },
    ],
  },
]);

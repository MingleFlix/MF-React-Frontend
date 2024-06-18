import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Root from '@/routes/root.tsx';
import ErrorPage from '@/error-page.tsx';
import { Login } from '@/pages/Login.tsx';
import { Register } from '@/pages/Register.tsx';
import { HomePage } from '@/pages/HomePage.tsx';
import RoomPage, { loader as roomLoader } from '@/pages/RoomPage.tsx';
import { WatchPage } from '@/pages/WatchPage.tsx';

const router = createBrowserRouter([
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
        path: 'watch',
        element: <WatchPage />,
      },
      {
        path: 'room/:roomId',
        element: <RoomPage />,
        loader: roomLoader,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);

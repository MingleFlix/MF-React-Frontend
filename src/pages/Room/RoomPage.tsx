import { useLoaderData } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext.tsx';
import { RoomSocket } from '@/pages/Room/components/RoomSocket.tsx';
import { RoomLoaderData } from '@/pages/Room/RoomLoader.ts';

export default function RoomPage() {
  const { roomId } = useLoaderData() as RoomLoaderData;
  const authContext = useContext(AuthContext);
  const { auth } = authContext;

  if (!auth || !roomId) {
    return null;
  }

  return (
    <div id='room-page'>
      <RoomSocket roomId={roomId} token={auth.token} />
    </div>
  );
}

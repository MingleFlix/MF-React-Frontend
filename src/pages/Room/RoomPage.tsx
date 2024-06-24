import { useLoaderData } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext.tsx';
import { RoomSocket } from '@/pages/Room/components/RoomSocket.tsx';

export async function loader({ params }) {
  const roomId: string = params.roomId;
  console.log(roomId);
  return { roomId };
}

export interface LoaderData {
  roomId: string;
}

export default function RoomPage() {
  const { roomId } = useLoaderData() as LoaderData;
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

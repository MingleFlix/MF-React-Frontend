import { useLoaderData } from 'react-router-dom';
import { WatchComponent } from '@/pages/Room/components/WatchComponent.tsx';

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
  // console.log(data);
  return (
    <div id='room-page'>
      <h1>Room: {roomId}</h1>
      <div id='room-content'>
        <WatchComponent />
      </div>
    </div>
  );
}

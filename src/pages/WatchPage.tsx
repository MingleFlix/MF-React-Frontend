import { useSearchParams, useNavigate } from 'react-router-dom';
import PlayerComponent from '../components/video/PlayerComponent';
import { useContext, useEffect } from 'react';
import { AuthContext } from '@/context/AuthContext';

export function WatchPage() {
  const authContext = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  let navigate = useNavigate();

  const videoSource = {
    type: 'video',
    sources: [
      {
        src: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4',
        type: 'video/mp4',
        size: 1080,
      },
    ],
  };

  const loadRoom = async (roomId: string, token: string) => {
    try {
      const room = await fetch('/api/room-management/verify', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId: roomId, token: token }),
      });

      if (!room.ok) {
        throw new Error('Failed to get room information');
      }

      const roomData = await room.json();

      // To-Do: Check if user is actually in room

      const queue = await fetch('/api/queue-management/items', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId: roomId, token: token }),
      });

      if (!queue.ok) {
        throw new Error('Failed to get room information');
      }

      const queueBody = await queue.json();

      // To-Do: Display Queue Items
      // To-Do: Load Player with first item
    } catch (error: any) {}
  };

  useEffect(() => {
    // Not working right now
    return;
    const roomId = searchParams.get('room_id');

    if (!roomId) {
      alert('Please create a room first');
      navigate('/');
    }

    // Get user auth data
    const { auth } = authContext;

    // Load room data
    loadRoom(roomId, auth.token);
  });

  return (
    <section id='about' className='h-[95vh]' style={{ padding: '20px 50px' }}>
      <div className='container h-[90vh] px-6 pt-[65px]'>
        <PlayerComponent source={videoSource}></PlayerComponent>
      </div>
    </section>
  );
}

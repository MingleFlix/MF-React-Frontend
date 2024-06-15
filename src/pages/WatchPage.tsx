import { useSearchParams, useNavigate } from 'react-router-dom';
import PlayerComponent from '../components/video/PlayerComponent';
import { useContext, useEffect } from 'react';
import { AuthContext } from '@/context/AuthContext';
import AddVideoInput from '@/components/video/AddVideoInput';
import VideoQueueComponent from '@/components/video/VideoQueueComponent';

export function WatchPage() {
  const authContext = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  let navigate = useNavigate();

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
      <div className='h-[90vh] pt-[65px]'>
        <div className='flex flex-col xl:flex-row justify-center'>
          <div className='pt-2 space-y-6 max-w-[100%] xl:max-w-[90%] 2xl:max-w-[70%]'>
            <AddVideoInput></AddVideoInput>
            <PlayerComponent></PlayerComponent>
          </div>
          <div className='flex flex-col'>
            <VideoQueueComponent></VideoQueueComponent>
          </div>
        </div>
      </div>
    </section>
  );
}

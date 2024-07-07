import { Heading } from '@/components/typography';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import React, { useCallback, useEffect, useState } from 'react';
import userPlaceholder from '@/assets/user-placeholder.webp';
import { Room } from '@/types/room.ts';
import { useNavigate } from 'react-router-dom';
import { WatchComponent } from '@/pages/Room/components/WatchComponent.tsx';

export function RoomSocket({
  roomId,
  token,
}: {
  roomId: string;
  token: string;
}) {
  /* Room logic */
  const [room, setRoom] = useState<Room>(null);
  const navigate = useNavigate();

  /* WebSocket logic */
  //Public API that will echo messages sent to it back to the client
  const [socketUrl, setSocketUrl] = useState(
    `/api/room-management?token=${token}&roomID=${roomId}`,
  );

  const [messageHistory, setMessageHistory] = useState<MessageEvent<any>[]>([]);

  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);

  useEffect(() => {
    if (lastMessage !== null) {
      setMessageHistory(prev => prev.concat(lastMessage));

      const data = JSON.parse(lastMessage.data);
      console.log('New message: \n', data);

      if (data.type === 'ROOM_STATE') {
        console.log('Room state:', data.room);
        setRoom(data.room);
      } else if (data.type === 'NOT_FOUND') {
        console.error('Room not found');
        navigate('/');
      } else if (data.type === 'USER_JOINED') {
        console.log('User joined:', data.user);
        setRoom(prev => ({
          ...prev,
          users: data.users,
        }));
      } else if (data.type === 'USER_LEFT') {
        console.log('User left:', data.user);
        setRoom(prev => ({
          ...prev,
          users: data.users,
        }));
      } else if (data.type === 'UNAUTHORIZED') {
        console.error(data.message);
        navigate('/login');
      } else {
        console.error('Unknown message:', data);
      }
    }
  }, [lastMessage]);

  const handleClickSendMessage = useCallback(() => sendMessage('Hello'), []);

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  if (!roomId || !token) {
    return null;
  }

  return (
    <>
      <div className='grid justify-center grid-col pt-[20px]'>
        <div
          id='room-actions'
          className={`relative bg-[#292929] border-b-[2px] rounded-lg ${readyState !== ReadyState.OPEN ? 'border-red-600 hover:border-red-400' : 'border-sky-600 hover:border-sky-400'}`}
        >
          <h1 className='p-4 text-4xl text-gray-400'>
            Room: {room?.name ?? 'loading...'}
          </h1>
          {/* <div
            id='debug'
            className='flex gap-2 justify-center content-center items-center'
          >
            <button onClick={handleClickSendMessage}>Send Message</button>
            <span>Connection status: {connectionStatus}</span>
          </div> */}
        </div>
        <div id='users'>
          <Heading className='pt-2 text-gray-400'>Users</Heading>
          <div
            id='user-list'
            className='flex gap-2 justify-center items-center p-2 w-full bg-transparent rounded-lg'
          >
            {room?.users.map(user => (
              <Card
                key={user.id}
                className='w-32 border-0  bg-[#292929] hover:bg-neutral-700 '
              >
                <CardHeader className='pt-4 pb-4'>
                  <CardTitle className='text-base text-gray-400'>
                    {user.name}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <div id='room-content' className='flex justify-center'>
        {<WatchComponent roomId={roomId}></WatchComponent>}
      </div>
    </>
  );
}

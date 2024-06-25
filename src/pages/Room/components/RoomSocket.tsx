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

      console.log(lastMessage);

      const data = JSON.parse(lastMessage.data);

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
      <h1>Room: {room?.name ?? 'loading...'}</h1>
      <div id='room-actions'>
        <div
          id='debug'
          className='flex gap-2 justify-center content-center items-center'
        >
          <button onClick={handleClickSendMessage}>Send Message</button>
          <span>Connection status: {connectionStatus}</span>
        </div>
        <div id='users'>
          <Heading>Users</Heading>
          <div
            id='user-list'
            className=' p-2 gap-2 items-center w-full justify-center flex'
          >
            {room?.users.map(user => (
              <Card key={user.id} className='w-32'>
                <CardHeader>
                  <CardTitle>{user.name}</CardTitle>
                </CardHeader>
                <CardContent className='flex flex-col items-center '>
                  <img
                    src={userPlaceholder}
                    width={56}
                    alt='user profile picture'
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <div id='room-content'>
        {/*{<WatchComponent roomId={roomId}></WatchComponent>}*/}
      </div>
    </>
  );
}

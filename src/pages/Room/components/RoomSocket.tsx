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
import { WatchComponent } from './WatchComponent';

export function RoomSocket({
  roomId,
  token,
}: {
  roomId: string;
  token: string;
}) {
  /* Room logic */
  const [room, setRoom] = useState<Room>(null);

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
          <div id='user-list' className='flex gap-2'>
            {room?.users.map(user => (
              <Card key={user.id}>
                <CardHeader>
                  <CardTitle>{user.name}</CardTitle>
                </CardHeader>
                <CardContent className='flex flex-col items-center '>
                  <img src={userPlaceholder} width={56} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <div id='room-content'>
        {<WatchComponent roomId={roomId}></WatchComponent>}
      </div>
    </>
  );
}

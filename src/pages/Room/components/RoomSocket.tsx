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

export function RoomSocket({
  roomId,
  token,
}: {
  roomId: string;
  token: string;
}) {
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
            <Card>
              <CardHeader>
                <CardTitle>Username</CardTitle>
              </CardHeader>
              <CardContent className='flex flex-col items-center '>
                <img src={userPlaceholder} width={56} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div id='room-content'>
        {/*<WatchComponent roomId={roomId}></WatchComponent>*/}
      </div>
    </>
  );
}

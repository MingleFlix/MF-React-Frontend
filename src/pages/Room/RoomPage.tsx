import { useLoaderData } from 'react-router-dom';
import { WatchComponent } from '@/pages/Room/components/WatchComponent.tsx';
import { useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/context/AuthContext.tsx';
import useWebSocket, { ReadyState } from 'react-use-websocket';

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
  //Public API that will echo messages sent to it back to the client
  const [socketUrl, setSocketUrl] = useState(`wss://echo.websocket.org`);

  useEffect(() => {
    console.log(auth);
    if (auth && auth.token) {
      setSocketUrl(`/api/room-management?token=${auth.token}&roomID=${roomId}`);
    }
  }, [auth]);

  const [messageHistory, setMessageHistory] = useState<MessageEvent<any>[]>([]);

  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);

  useEffect(() => {
    if (lastMessage !== null) {
      setMessageHistory(prev => prev.concat(lastMessage));
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

  // console.log(data);
  return (
    <div id='room-page'>
      <h1>Room: {roomId}</h1>
      <div id='room-content'>
        <WatchComponent roomId={roomId}></WatchComponent>
      </div>
    </div>
  );
}

import { AuthContext } from '@/context/AuthContext';
import { PlayerEvent } from '@/types/events';
import React, { useState, useEffect, useRef, useContext } from 'react';

const AddVideoInput: React.FC<{ roomId: string }> = ({ roomId }) => {
  // Auth
  const authContext = useContext(AuthContext);
  const { auth } = authContext;

  // Check is temporary for dev purposes
  const user = auth
    ? auth.userId
    : (Math.random() + 1).toString(36).substring(7);

  const token = auth ? auth.token : 'test-token';

  const [inputValue, setInputValue] = useState<string>('');
  const ws = useRef<WebSocket | null>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  useEffect(() => {
    // Create URL used for websocket
    var webSocketUrl = new URL(
      `/api/video-management?roomID=${roomId}&type=input&token=${token}`,
      window.location.href,
    );

    // Need to switch protocol
    webSocketUrl.protocol = webSocketUrl.protocol.replace('http', 'ws');

    // Initialize WebSocket connection
    ws.current = new WebSocket(webSocketUrl.href);

    ws.current.onopen = () => {
      console.log('WebSocket connection opened');
    };

    ws.current.onclose = () => {
      console.log('WebSocket connection closed');
    };

    ws.current.onerror = error => {
      console.error('WebSocket error', error);
    };
  }, []);

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return;
    }

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const playerEvent: PlayerEvent = {
        room: roomId,
        event: 'add-video',
        user: '',
        time: 0,
        url: inputValue,
      };

      ws.current.send(JSON.stringify(playerEvent));
      console.log('Sent to WebSocket:', inputValue);
    } else {
      console.error('WebSocket is not open');
    }
  };

  return (
    <div className='relative mb-6 bg-[#292929] border-sky-600 hover:border-sky-400 transition duration-400 ease-in-out border-b-[2px] rounded-lg'>
      <input
        type='url'
        className='block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none text-white/80'
        name='videoUrl'
        placeholder='Add Video URL'
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
      />
    </div>
  );
};

export default AddVideoInput;

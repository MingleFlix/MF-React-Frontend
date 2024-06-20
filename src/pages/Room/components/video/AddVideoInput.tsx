import { PlayerEvent } from '@/types/events';
import React, { useState, useEffect, useRef } from 'react';

const AddVideoInput: React.FC = () => {
  // =========================
  // To-Do: Use actual room id
  const ROOM_ID = '1';
  // =========================

  const [inputValue, setInputValue] = useState<string>('');
  const ws = useRef<WebSocket | null>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  useEffect(() => {
    // Create URL used for websocket
    var webSocketUrl = new URL(
      `/api/video-management?roomID=${ROOM_ID}&type=input`,
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
        room: ROOM_ID,
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

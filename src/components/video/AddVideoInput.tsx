import React, { useState, useEffect, useRef } from 'react';

const AddVideoInput: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>('');
  const ws = useRef<WebSocket | null>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  useEffect(() => {
    // Initialize the WebSocket connection
    ws.current = new WebSocket('ws://127.0.0.1:3003/video');

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
      ws.current.send(JSON.stringify({ event: 'add-video', url: inputValue }));
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

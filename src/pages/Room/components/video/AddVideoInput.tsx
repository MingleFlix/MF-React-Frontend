import { AuthContext } from '@/context/AuthContext';
import { PlayerEvent } from '@/types/events';
import React, { useState, useContext } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

const AddVideoInput: React.FC<{ roomId: string }> = ({ roomId }) => {
  // Auth
  const authContext = useContext(AuthContext);
  const { auth } = authContext;
  const user = auth.username;
  const token = auth.token;

  const [inputValue, setInputValue] = useState<string>('');

  // Socket
  const [socketUrl] = useState(
    `/api/video-management?roomID=${roomId}&type=input&token=${token}`,
  );

  const { sendMessage, readyState } = useWebSocket(socketUrl);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || readyState !== ReadyState.OPEN) {
      return;
    }

    const playerEvent: PlayerEvent = {
      room: roomId,
      event: 'add-video',
      user: user,
      time: 0,
      url: inputValue,
    };

    sendMessage(JSON.stringify(playerEvent));
  };

  return (
    <div
      className={`relative mb-4 bg-[#292929] transition duration-400 ease-in-out border-b-[2px] rounded-lg sm:px-2 lg:px-4 ${readyState !== ReadyState.OPEN ? 'border-red-600 hover:border-red-400' : 'border-sky-600 hover:border-sky-400'}`}
    >
      {readyState === ReadyState.OPEN && (
        <input
          type='url'
          className='block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none text-white/80'
          name='videoUrl'
          placeholder='Add Video URL'
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
        />
      )}
      {readyState !== ReadyState.OPEN && (
        <input
          type='url'
          className='block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none text-white/80 cursor-not-allowed'
          name='videoUrl'
          placeholder='No connection to server!'
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          disabled
        />
      )}
    </div>
  );
};

export default AddVideoInput;

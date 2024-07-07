import { AuthContext } from '@/context/AuthContext';
import { PlayerEvent, QueueEvent, QueueItem } from '@/types/events';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

/*
 * Author: Alexandre Kaul
 * Matrikelnummer: 2552912
 */

const VideoQueueComponent: React.FC<{ roomId: string }> = ({ roomId }) => {
  // Auth
  const authContext = useContext(AuthContext);
  const { auth } = authContext;
  const user = auth.username;
  const token = auth.token;

  // Queue
  const [queueItems, setQueueItems] = useState<Array<QueueItem>>([]);

  // Socket
  const [socketUrl] = useState(
    `/api/video-management?roomID=${roomId}&type=queue&token=${token}`,
  );

  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);

  useEffect(() => {
    if (lastMessage !== null) {
      const queueEvent = JSON.parse(lastMessage.data) as QueueEvent;
      console.log('Received queue message from Server', queueEvent);

      switch (queueEvent.event) {
        case 'add-video':
        case 'sync-ack-queue':
          setQueueItems(queueEvent.items);
          break;
        case 'delete-video':
          // handle delete event if needed
          break;
        default:
          break;
      }
    }
  }, [lastMessage]);

  useEffect(() => {
    console.log('Socket Readystate:', readyState);
    if (readyState === ReadyState.OPEN) {
      // Send Sync-request
      const playerEvent: PlayerEvent = {
        room: roomId,
        event: 'sync-queue',
        user: user,
        time: 0,
        url: null,
      };

      sendMessage(JSON.stringify(playerEvent));
    }
  }, [readyState]);

  const deleteQueueItem = useCallback(
    (item: QueueItem) => {
      if (readyState !== ReadyState.OPEN) {
        alert('No connection to Video Sync Service!');
        return;
      }
      const playerEvent: PlayerEvent = {
        room: roomId,
        event: 'delete-video',
        user: user,
        time: 0,
        url: item.url,
      };

      sendMessage(JSON.stringify(playerEvent));
    },
    [queueItems, roomId, user],
  );

  const playQueueItem = (item: QueueItem) => {
    if (readyState !== ReadyState.OPEN) {
      alert('No connection to Video Sync Service!');
      return;
    }

    const playerEvent: PlayerEvent = {
      room: roomId,
      event: 'play-video',
      user: user,
      time: 0,
      url: item.url,
    };

    console.log('Requesting video play:', playerEvent);

    sendMessage(JSON.stringify(playerEvent));
  };

  return (
    <div className='2xl:w-[450px] !z-[0]'>
      <div
        className={`relative mb-6 bg-[#292929] border-b-[2px] rounded-lg ${readyState !== ReadyState.OPEN ? 'border-red-600 hover:border-red-400' : 'border-sky-600 hover:border-sky-400'}`}
      >
        <div className='p-[14px]'>
          <p className='pb-2 text-lg font-bold leading-normal text-white'>
            Queue
          </p>
        </div>
        <div className='overflow-scroll min-h-[150px] max-h-[67vh] bg-neutral-950/50 m-1 rounded-lg'>
          <div className='grid grid-cols-1 gap-[2px]'>
            {readyState !== ReadyState.OPEN && (
              <p className='pb-5 text-red-500'>Loading...</p>
            )}
            {queueItems.map((item, index) => (
              <a
                onClick={() => playQueueItem(item)}
                href='#'
                key={index}
                className='cursor-pointer'
              >
                <div
                  className={`flex flex-row rounded-lg px-4 ${item.active ? 'hover:bg-sky-800/50 bg-sky-800/30' : 'hover:bg-sky-800/30 bg-sky-800/10'}`}
                >
                  <div className='flex items-center pl-1 w-10 h-14 text-white'>
                    <p>⮞</p>
                  </div>
                  <div className='content-center pl-2 basis-3/4'>
                    <p className='text-sm font-bold text-white'>{item.url}</p>
                    <p className='text-sm font-medium text-white'>
                      added by {item.user}
                    </p>
                  </div>
                  <div className='flex absolute right-0 items-center w-10 h-14 text-white'>
                    <a href='#' onClick={() => deleteQueueItem(item)}>
                      <p className='text-red-600'>✕</p>
                    </a>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoQueueComponent;

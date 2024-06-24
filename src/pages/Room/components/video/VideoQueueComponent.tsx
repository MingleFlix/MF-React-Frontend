import { AuthContext } from '@/context/AuthContext';
import { PlayerEvent, QueueEvent } from '@/types/events';
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

interface QueueItem {
  user: string;
  url: string;
  active: boolean;
}

const VideoQueueComponent: React.FC<{ roomId: string }> = ({ roomId }) => {
  const [queueItems, setQueueItems] = useState<Array<QueueItem>>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Auth
  const authContext = useContext(AuthContext);
  const { auth } = authContext;

  // Check is temporary for dev purposes
  const user = auth
    ? auth.username
    : (Math.random() + 1).toString(36).substring(7);

  const token = auth ? auth.token : 'test-token';
  const ws = useRef<WebSocket | null>(null);

  const deleteQueueItem = useCallback(
    (index: number, item: QueueItem) => {
      console.log('Deleting', index);
      const newArray = queueItems.filter((_qItem, qIndex) => qIndex !== index);
      setQueueItems(newArray);

      // Send update to all other clients
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        const playerEvent: PlayerEvent = {
          room: roomId,
          event: 'delete-video',
          user: user,
          time: 0,
          url: item.url,
        };

        ws.current.send(JSON.stringify(playerEvent));
        console.log('Sent to WebSocket:', item);
      } else {
        console.error('WebSocket is not open');
      }
    },
    [queueItems, roomId, user],
  );

  const playQueueItem = (item: QueueItem) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const playerEvent: PlayerEvent = {
        room: roomId,
        event: 'play-video',
        user: user,
        time: 0,
        url: item.url,
      };

      ws.current.send(JSON.stringify(playerEvent));
      console.log('Sent to WebSocket:', item);
    } else {
      console.error('WebSocket is not open');
    }
  };

  useEffect(() => {
    // Create URL used for websocket
    const webSocketUrl = new URL(
      `/api/video-management?roomID=${roomId}&type=queue&token=${token}`,
      window.location.href,
    );

    // Need to switch protocol
    webSocketUrl.protocol = webSocketUrl.protocol.replace('http', 'ws');

    // Initialize WebSocket connection
    ws.current = new WebSocket(webSocketUrl.href);

    ws.current.onopen = () => {
      console.log('WebSocket connection opened, trying to sync-queue');
    };

    ws.current.onclose = () => {
      console.log('WebSocket connection closed');
    };

    ws.current.onerror = error => {
      console.error('WebSocket error', error);
    };

    ws.current.onmessage = event => {
      const queueEvent = JSON.parse(event.data) as QueueEvent;
      console.log('Received queue message from Server', queueEvent);

      switch (queueEvent.event) {
        case 'add-video':
        case 'play-video':
        case 'sync-ask-queue':
          setQueueItems(queueEvent.items);
          break;
        case 'delete-video':
          // handle delete event if needed
          break;
        default:
          break;
      }
    };

    return () => {
      ws.current?.close();
    };
  }, [roomId, token, user]);

  useEffect(() => {
    const loadQueue = () => {
      // Fetch queue
      setTimeout(() => {
        if (ws.current) {
          // Send Sync-request
          const playerEvent: PlayerEvent = {
            room: roomId,
            event: 'sync-queue',
            user: user,
            time: 0,
            url: null,
          };

          ws.current.send(JSON.stringify(playerEvent));

          setLoading(false);
        } else {
          loadQueue();
        }
      }, 1500);
    };

    loadQueue();
  }, [roomId, token, user]);

  return (
    <div className='2xl:w-[450px] !z-[0]'>
      <div className='relative mb-6 bg-[#292929] border-sky-600 border-b-[2px] rounded-lg'>
        <div className='p-[14px]'>
          <p className='leading-normal text-lg font-bold text-white pb-2'>
            Queue
          </p>
        </div>
        <div className='overflow-scroll min-h-[150px] max-h-[67vh] bg-neutral-950/50 m-1 rounded-lg'>
          <div className='grid grid-cols-1 gap-[2px]'>
            {loading && <p className='pb-5 text-green-500'>Loading...</p>}
            {queueItems.map((item, index) => (
              <a
                onClick={() => playQueueItem(item)}
                key={index}
                className='cursor-pointer'
              >
                <div
                  className={`flex flex-row rounded-lg px-4 ${item.active ? 'hover:bg-sky-800/50 bg-sky-800/30' : 'hover:bg-sky-800/30 bg-sky-800/10'}`}
                >
                  <div className='w-10 h-14 flex items-center text-white pl-1'>
                    <p>⮞</p>
                  </div>
                  <div className='basis-3/4 pl-2 content-center'>
                    <p className='text-white text-sm font-bold'>{item.url}</p>
                    <p className='text-white text-sm font-medium'>
                      added by {item.user}
                    </p>
                  </div>
                  <div className='w-10 h-14 flex items-center text-white absolute right-0'>
                    <a onClick={() => deleteQueueItem(index, item)}>
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

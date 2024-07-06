import { useCallback, useContext, useEffect, useRef, useState } from 'react';

import { PlayerEvent } from '@/types/events';
import { AuthContext } from '@/context/AuthContext';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import Plyr from 'plyr';

export function VideoSocket({
  roomId,
  initPlayer,
}: {
  roomId: string;
  initPlayer: any;
}) {
  // Auth
  const authContext = useContext(AuthContext);
  const { auth } = authContext;
  const user = auth.username;
  const token = auth.token;

  console.log('Room:', roomId, 'User:', user, 'Token:', token);

  // Mutable refs to avoid re-renders
  const sendEventRef = useRef(true);
  const firstEventRef = useRef<PlayerEvent | null>(null);

  // Socket
  const [socketUrl] = useState(
    `/api/video-management?roomID=${roomId}&type=player&token=${token}`,
  );

  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);

  const sendPlayerEventToServer = useCallback(
    (event: string, time: number, url: string, override = false) => {
      if (!sendEventRef.current && !override) return;
      const eventToSend: PlayerEvent = {
        room: roomId,
        event,
        user,
        time,
        url,
      };

      sendMessage(JSON.stringify(eventToSend));
    },
    [roomId, sendMessage, user],
  );

  const waitForPlayer = () => {
    return new Promise(resolve => {
      const checkPlayer = setInterval(() => {
        // @ts-ignore
        if (window.player instanceof Plyr) {
          clearInterval(checkPlayer);
          // @ts-ignore
          resolve(window.player);
        }
      }, 100); // Check every 100 milliseconds
    });
  };

  const initEventListeners = () => {
    // Wait for player being initialized
    waitForPlayer().then(() => {
      // Get player instance
      // @ts-ignore
      const player = window.player;

      // Event Listener for play event
      player.on('play', () => {
        const currentTime = player.currentTime;
        console.log('Video started at ' + currentTime);

        if (firstEventRef.current == null) {
          // @ts-ignore
          sendPlayerEventToServer('play', currentTime, player.source);
        } else {
          sendEventRef.current = false;

          player.currentTime = firstEventRef.current.time;

          firstEventRef.current.event.includes('sync-ack-play')
            ? player.play()
            : player.pause();

          // Re-request sync, as our client might be out of sync
          sendPlayerEventToServer('re-sync', 0, null, true);

          setTimeout(() => {
            sendEventRef.current = true;
          }, 800);
        }

        firstEventRef.current = null;
      });

      // Event Listener for pause event
      player.on('pause', () => {
        console.log('Video stopped at ' + player.currentTime);
        sendPlayerEventToServer(
          'pause',
          player.currentTime,
          // @ts-ignore
          player.source,
          false,
        );
      });
    });
  };

  // Function to handle the custom event
  function onPlyrReady() {
    // @ts-ignore
    const player = window.player as Plyr;
    if (player instanceof Plyr) {
      if (firstEventRef == null) {
        return;
      }

      if (firstEventRef.current.event.includes('play')) {
        console.log('Trying to play!');
        player.play();
      } else {
        player.pause();
      }

      setTimeout(
        () => (player.currentTime = firstEventRef.current.time + 0.9),
        800,
      );
    }
  }

  // Add an event listener for the custom event
  window.addEventListener('plyrReady', onPlyrReady);

  useEffect(() => {
    if (lastMessage !== null) {
      const playerEvent = JSON.parse(lastMessage.data) as PlayerEvent;
      if (playerEvent.user === user && playerEvent.event !== 'play-video')
        return;

      // @ts-ignore
      const player = window.player as Plyr;

      const handleReceivedPlayerEvents = (playerEvent: PlayerEvent) => {
        sendEventRef.current = false;
        player.currentTime = playerEvent.time;
        playerEvent.event.includes('play') ? player.play() : player.pause();
        setTimeout(() => (sendEventRef.current = true), 800);
      };

      switch (playerEvent.event) {
        case 'sync':
          if (!player) return;
          player.playing
            ? sendPlayerEventToServer(
                'sync-ack-play',
                player.currentTime,
                // @ts-ignore
                player.source,
              )
            : sendPlayerEventToServer(
                'sync-ack-pause',
                player.currentTime,
                // @ts-ignore
                player.source,
              );
          break;
        case 're-sync':
          if (!player) return;
          player.playing
            ? // @ts-ignore
              sendPlayerEventToServer('play', player.currentTime, player.source)
            : sendPlayerEventToServer(
                'pause',
                player.currentTime,
                // @ts-ignore
                player.source,
              );
          break;
        case 'sync-ack-play':
        case 'sync-ack-pause':
          sendEventRef.current = false;
          initPlayer(playerEvent.url, playerEvent.time);
          firstEventRef.current = playerEvent;
          waitForPlayer().then(() => {
            setTimeout(() => {
              sendEventRef.current = true;
              initEventListeners();
            }, 800);
          });
          break;
        case 'play-video':
          initPlayer(playerEvent.url, playerEvent.time);
          setTimeout(() => {
            initEventListeners();
          }, 500);
          break;
        case 'play':
        case 'pause':
          handleReceivedPlayerEvents(playerEvent);
          break;
        default:
          break;
      }
    }
  }, [lastMessage, sendPlayerEventToServer, user]);

  useEffect(() => {
    console.log('Socket Readystate:', readyState);
    if (readyState === ReadyState.OPEN) {
      // Wait for player being initialized
      waitForPlayer().then(() => {
        // Sync request
        sendPlayerEventToServer('sync', 0, null, true);
      });
    }
  }, [readyState]);

  return <></>;
}

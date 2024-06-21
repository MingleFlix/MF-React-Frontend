import React, { useCallback, useEffect, useRef, useState } from 'react';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import { PlayerEvent } from '@/types/events';

const PlyrVideoPlayer: React.FC = () => {
  const ROOM_ID = '1'; // To-Do: Use actual room id
  const user = (Math.random() + 1).toString(36).substring(7); // To-Do: Get actual user from auth context

  const [ambientMode, setAmbientMode] = useState(true); // Toggle player ambient mode
  const playerRef = useRef<Plyr | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null); // canvas used for ambient mode
  const wsRef = useRef<WebSocket | null>(null);

  // We have to block sending events,
  // because receiving player events causing it to send events
  // resulting in an endless loop of events being broadcasted
  let sendEvent = true;

  // When joining the room, we ask all other members what the current event is
  // We store this "first" event we received here, so we can intialize the player
  let firstEvent: PlayerEvent = null;

  const setCanvasDimension = useCallback(
    (canvas: HTMLCanvasElement, video: HTMLVideoElement) => {
      if (!ambientMode) return;
      canvas.height = video.offsetHeight;
      canvas.width = video.offsetWidth;
    },
    [ambientMode],
  );

  const paintStaticVideo = useCallback(
    (ctx: CanvasRenderingContext2D, video: HTMLVideoElement) => {
      if (!ambientMode) return;
      ctx.drawImage(video, 0, 0, video.offsetWidth, video.offsetHeight);
    },
    [ambientMode],
  );

  const handleResize = (
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    video: HTMLVideoElement,
  ) => {
    // When resizing the window we also need to resize the canvas for ambient mode
    setCanvasDimension(canvas!, video);
    if (video.paused) {
      paintStaticVideo(ctx!, video);
    }
  };

  const sendPlayerEventToServer = useCallback(
    (event: string, time: number, url: string, override = false) => {
      if (!sendEvent && !override) return;
      const eventToSend: PlayerEvent = {
        room: ROOM_ID,
        event,
        user,
        time,
        url,
      };
      wsRef.current?.send(JSON.stringify(eventToSend));
    },
    [ROOM_ID, sendEvent, user],
  );

  const generateVideoSource = useCallback((source: string): Plyr.SourceInfo => {
    const youtubeRegex =
      /(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/i;
    const match = source.match(youtubeRegex);
    if (match) {
      setAmbientMode(false);
      return {
        type: 'video',
        sources: [{ src: match[1], provider: 'youtube' }],
      };
    }
    return {
      type: 'video',
      sources: [{ src: source, type: 'video/mp4', size: 1080 }],
    };
  }, []);

  const initPlayer = (source: string) => {
    // Destroy old Player instance
    // React has some weird side effects
    playerRef.current?.destroy();

    const player = new Plyr(document.getElementById('player'), {
      controls: [
        'play',
        'progress',
        'current-time',
        'mute',
        'volume',
        'fullscreen',
      ],
    });

    player.source = generateVideoSource(source);
    playerRef.current = player;

    // Canvas for player ambient mode
    const canvas = canvasRef.current;
    const ctx = canvas!.getContext('2d');
    // Our further logic requires a standard html5 video object
    // Using the plyr player or the videoRef doesn't work
    const video = document.getElementsByTagName('video')[0];

    setCanvasDimension(canvas!, video);
    paintStaticVideo(ctx!, video);
    window.addEventListener('resize', () => handleResize(canvas, ctx, video));

    // Event Listener for play event
    player.on('play', () => {
      setCanvasDimension(canvas!, video);

      // Main loop for ambient mode
      (function loop() {
        if (!player.paused && !player.ended && ambientMode) {
          ctx.drawImage(video, 0, 0, video.offsetWidth, video.offsetHeight);
          setTimeout(loop, 24000 / 1001); // drawing at 23.976fps
        }
      })();

      const currentTime = player.currentTime;
      console.log('Video started at ' + currentTime);

      if (firstEvent == null) {
        // @ts-ignore
        sendPlayerEventToServer('play', currentTime, player.source);
      } else {
        sendEvent = false;

        player.currentTime = firstEvent.time;

        firstEvent.event.includes('sync-ack-play')
          ? player.play()
          : player.pause();

        // Re-request sync, as our client might be out of sync
        sendPlayerEventToServer('re-sync', 0, null, true);

        setTimeout(() => {
          sendEvent = true;
        }, 500);
      }

      firstEvent = null;
    });

    // Event Listener for pause event
    player.on('pause', () => {
      console.log('Video stopped at ' + player.currentTime);
      // @ts-ignore
      sendPlayerEventToServer('pause', player.currentTime, player.source);
    });

    player.on('statechange', (event: any) => {
      const youtubeState = event.detail.code;

      if (youtubeState === 1) {
        if (firstEvent == null) {
          // @ts-ignore
          sendPlayerEventToServer('play', player.currentTime, player.source);
        }
      }

      if (youtubeState === 2) {
        // @ts-ignore
        sendPlayerEventToServer('pause', player.currentTime, player.source);
      }
    });
  };

  useEffect(() => {
    // Create URL used for websocket
    var webSocketUrl = new URL(
      `/api/video-management?roomID=${ROOM_ID}&type=player`,
      window.location.href,
    );

    // Need to switch protocol
    webSocketUrl.protocol = webSocketUrl.protocol.replace('http', 'ws');

    // Initialize WebSocket connection
    wsRef.current = new WebSocket(webSocketUrl.href);

    wsRef.current.onopen = () => {
      console.log('WebSocket connection opened');

      // Sync request
      sendPlayerEventToServer('sync', 0, null);
    };

    // Default video
    // setTimeout(() => {
    //   initPlayer(
    //     'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4',
    //   );
    // }, 200);

    wsRef.current.onmessage = event => {
      const playerEvent = JSON.parse(event.data) as PlayerEvent;
      const player = playerRef.current;
      if (playerEvent.user === user) return;

      const handleReceivedPlayerEvents = (playerEvent: PlayerEvent) => {
        sendEvent = false;
        player.currentTime = playerEvent.time;
        playerEvent.event.includes('play') ? player.play() : player.pause();
        setTimeout(() => (sendEvent = true), 500);
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
          if (player) return;
          sendEvent = false;
          initPlayer(playerEvent.url);
          firstEvent = playerEvent;
          setTimeout(() => (sendEvent = true), 500);
          break;
        case 'add-video':
          player?.destroy();
          initPlayer(playerEvent.url);
          break;
        case 'play':
        case 'pause':
          handleReceivedPlayerEvents(playerEvent);
          break;
        default:
          break;
      }
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket connection closed');
    };

    wsRef.current.onerror = error => {
      console.error('WebSocket error', error);
    };
  });

  return (
    <div className='relative z-[1]'>
      <canvas ref={canvasRef} className='decoy'></canvas>
      <video id='player' className='plyr-react plyr' playsInline />
    </div>
  );
};

export default React.memo(PlyrVideoPlayer);

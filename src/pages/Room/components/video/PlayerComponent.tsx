import React, { useCallback, useEffect, useRef, useState } from 'react';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import { PlayerEvent } from '@/types/events';

const PlyrVideoPlayer: React.FC = () => {
  const ROOM_ID = '1'; // To-Do: Use actual room id
  const user = (Math.random() + 1).toString(36).substring(7); // To-Do: Get actual user from auth context

  const [ambientMode, setAmbientMode] = useState(true); // Toggle player ambient mode
  const canvasRef = useRef<HTMLCanvasElement>(null); // canvas used for ambient mode
  const wsRef = useRef<WebSocket | null>(null);

  // We have to block sending events,
  // because receiving player events causing it to send events
  // resulting in an endless loop of events being broadcasted
  let sendEvent = true;

  // When joining the room, we ask all other members what the current event is
  // We store this "first" event we received here, so we can intialize the player
  let firstEvent: PlayerEvent = null;

  // We don't want to re-render the react player component
  // as it results in many unwanted side effects
  // So we use the same player object and properly destroy it (see initPlayer())
  let player = null;

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
    if (player != null) {
      player.destroy();
    }

    // Init Player
    player = new Plyr(document.getElementById('player'), {
      controls: [
        'play',
        'progress',
        'current-time',
        'mute',
        'volume',
        'fullscreen',
      ],
    });

    // Set Player video source
    player.source = generateVideoSource(source);

    // Canvas for player ambient mode
    const canvas = canvasRef.current;
    const ctx = canvas!.getContext('2d');
    // Our further logic requires a standard html5 video object
    // Using the plyr player or the videoRef doesn't work
    const video = document.getElementsByTagName('video')[0];

    // Init Canvas
    setCanvasDimension(canvas!, video);
    paintStaticVideo(ctx!, video);

    // When resizing the window we also need to resize the canvas
    // Else it will float in space where it doesn't belong
    const handleResize = () => {
      setCanvasDimension(canvas!, video);
      if (video.paused) {
        paintStaticVideo(ctx!, video);
      }
    };

    window.addEventListener('resize', handleResize);

    // Event Listener for play event
    player.on('play', () => {
      setCanvasDimension(canvas!, video);

      // Main loop for ambient mode
      (function loop() {
        if (!player.paused && !player.ended) {
          ctx.drawImage(video, 0, 0, video.offsetWidth, video.offsetHeight);
          setTimeout(loop, 24000 / 1001); // drawing at 23.976fps
        }
      })();

      const currentTime = player.currentTime;
      console.log('Video started at ' + currentTime);

      if (firstEvent == null) {
        sendPlayerEventToServer('play', currentTime, player.source);
      } else {
        sendEvent = false;

        player.currentTime = firstEvent.time;

        if (firstEvent.event == 'sync-ack-play') {
          player.play();
        }
        if (firstEvent.event == 'sync-ack-pause') {
          player.pause();
        }

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
      sendPlayerEventToServer('pause', player.currentTime, player.source);
    });

    // Event Listener for seeked event
    player.on('seeked', () => {
      console.log('Video seeked to ' + player.currentTime);
      paintStaticVideo(ctx!, video);
      sendPlayerEventToServer('seeked', player.currentTime, player.source);
    });

    player.on('statechange', (event: any) => {
      const youtubeState = event.detail.code;

      if (youtubeState === 1) {
        if (firstEvent == null) {
          sendPlayerEventToServer('play', player.currentTime, player.source);
        }
      }

      if (youtubeState === 2) {
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
      //console.log('Received message', event);
      const playerEvent = JSON.parse(event.data) as PlayerEvent;

      // We try to prevent receiving our own events server-side
      // However we want to make sure
      if (playerEvent.user == user) {
        console.log('Ignoring event');
        return;
      }

      if (playerEvent.event === 'sync') {
        // Other client asked to sync

        if (player == null) {
          // We can't respond to that request
          return;
        }

        if (player.playing) {
          console.log('Sending sync-ack play');
          sendPlayerEventToServer(
            'sync-ack-play',
            player.currentTime,
            player.source,
          );
        } else if (player.paused) {
          console.log('Sending sync-ack pause');
          sendPlayerEventToServer(
            'sync-ack-pause',
            player.currentTime,
            player.source,
          );
        }
      }

      if (playerEvent.event === 're-sync') {
        // Other client asked to re-sync
        console.log('Received re-sync request');

        if (player == null) {
          // We can't respond to that request
          return;
        }

        if (player.playing) {
          console.log('Sending re-sync-ack play');
          sendPlayerEventToServer(
            're-sync-ack-play',
            player.currentTime,
            player.source,
          );
        } else if (player.paused) {
          console.log('Sending re-sync-ack pause');
          sendPlayerEventToServer(
            're-sync-ack-pause',
            player.currentTime,
            player.source,
          );
        }
      }

      if (
        (playerEvent.event === 'sync-ack-play' ||
          playerEvent.event === 'sync-ack-pause') &&
        player == null
      ) {
        console.log('Received sync-ack');
        sendEvent = false;
        // init Player with video url
        initPlayer(playerEvent.url);

        // We can't invoke play() or pause() on first start without user interaction
        // This is because pretty much all browsers don't allow autoplay
        firstEvent = playerEvent;

        setTimeout(() => {
          sendEvent = true;
        }, 500);
      }

      if (
        (playerEvent.event === 're-sync-ack-play' ||
          playerEvent.event === 're-sync-ack-pause') &&
        player != null
      ) {
        console.log('Received re-sync-ack');
        sendEvent = false;

        player.currentTime = playerEvent.time;

        if (playerEvent.event == 're-sync-ack-play') {
          player.play();
        }
        if (playerEvent.event == 're-sync-ack-pause') {
          player.pause();
        }

        setTimeout(() => {
          sendEvent = true;
        }, 500);
      }

      if (playerEvent.event === 'add-video') {
        // Destroy old Player instance
        if (player != null) {
          player.destroy();
        }

        // Re-init Player with new video url
        initPlayer(playerEvent.url);
      }

      if (playerEvent.event === 'play' && playerEvent.user != user) {
        sendEvent = false;
        player.currentTime = playerEvent.time;
        player.play();
        setTimeout(() => {
          sendEvent = true;
        }, 500);
      }

      if (playerEvent.event === 'pause' && playerEvent.user != user) {
        sendEvent = false;
        player.currentTime = playerEvent.time;
        player.pause();
        setTimeout(() => {
          sendEvent = true;
        }, 500);
      }

      if (playerEvent.event === 'seeked' && playerEvent.user != user) {
        sendEvent = false;
        player.currentTime = playerEvent.time;
        setTimeout(() => {
          sendEvent = true;
        }, 500);
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

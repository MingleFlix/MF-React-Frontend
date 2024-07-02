import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import { PlayerEvent } from '@/types/events';
import { AuthContext } from '@/context/AuthContext';
import useWebSocket, { ReadyState } from 'react-use-websocket';

const PlyrVideoPlayer: React.FC<{ roomId: string }> = ({ roomId }) => {
  // Auth
  const authContext = useContext(AuthContext);
  const { auth } = authContext;
const user = auth.username;
  const token = auth.token;

  console.log('Room:', roomId, 'User:', user, 'Token:', token);

  const [ambientMode, setAmbientMode] = useState(true); // Toggle player ambient mode
  const [error, setError] = useState<string>('');
  const playerRef = useRef<Plyr | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null); // canvas used for ambient mode

  // Socket
  const [socketUrl] = useState(
    `/api/video-management?roomID=${roomId}&type=player&token=${token}`,
  );

  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);

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
      if (!video) return;
      canvas.height = video.offsetHeight;
      canvas.width = video.offsetWidth;
    },
    [ambientMode],
  );

  const paintStaticVideo = useCallback(
    (ctx: CanvasRenderingContext2D, video: HTMLVideoElement) => {
      if (!ambientMode) return;
      if (!video) return;
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
        room: roomId,
        event,
        user,
        time,
        url,
      };

      sendMessage(JSON.stringify(eventToSend));
    },
    [roomId, sendEvent, user],
  );

  const generateVideoSource = useCallback((source: string): Plyr.SourceInfo => {
    // const youtubeRegex =
    //   /(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/i;
    // const match = source.match(youtubeRegex);
    // if (match) {
    //   setAmbientMode(false);
    //   return {
    //     type: 'video',
    //     sources: [{ src: match[1], provider: 'youtube' }],
    //   };
    // }
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

    // To get autoplay working, we have to mute the player
    player.volume = 0;

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
        if (!player.paused && !player.ended && ambientMode && video) {
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

    // player.on('statechange', (event: any) => {
    //   const youtubeState = event.detail.code;
    //   if (!sendEvent) return;
    //   console.log('=== YouTube State Changed ===');

    //   sendEvent = false;

    //   if (youtubeState === 1) {
    //     if (firstEvent == null) {
    //       // @ts-ignore
    //       sendPlayerEventToServer(
    //         'play',
    //         player.currentTime,
    //         player.source as unknown as string,
    //         true,
    //       );
    //     }
    //   }

    //   if (youtubeState === 2) {
    //     // @ts-ignore
    //     sendPlayerEventToServer(
    //       'pause',
    //       player.currentTime,
    //       player.source as unknown as string,
    //       true,
    //     );
    //   }

    //   setTimeout(() => {
    //     sendEvent = true;
    //   }, 1500);
    // });

    // Add custom double tap logic
    player.on('ready', () => {
      doubleClick(player);
    });
  };

  // Code Source: https://github.com/sampotts/plyr/issues/2156#issuecomment-1256708414
  // Slightly adjusted for typescript
  function doubleClick(player: any) {
    const byClass = document.getElementsByClassName.bind(document),
      createElement = document.createElement.bind(document);

    // Remove all dblclick stuffs
    player.eventListeners.forEach(function (eventListener: {
      type: string;
      element: {
        removeEventListener: (arg0: any, arg1: any, arg2: any) => void;
      };
      callback: any;
      options: any;
    }) {
      if (eventListener.type === 'dblclick') {
        eventListener.element.removeEventListener(
          eventListener.type,
          eventListener.callback,
          eventListener.options,
        );
      }
    });

    // Create overlay that will show the skipped time
    const skip_ol = createElement('div');
    skip_ol.id = 'plyr__time_skip';
    byClass('plyr')[0].appendChild(skip_ol);

    // A class to manage multi click count and remember last clicked side (may cause issue otherwise)
    class multiclick_counter {
      timers: any[];
      count: number;
      reseted: number;
      last_side: null;
      timer: any[];
      last_click: string;

      constructor() {
        this.timers = []; // collection of timers. Important
        this.count = 0; // click count
        this.reseted = 0; // before resetting what was the count
        this.last_side = null; // L C R 3sides
      }

      clicked() {
        this.count += 1;
        var xcount = this.count; // will be checked if click count increased in the time
        this.timers.push(setTimeout(this.reset.bind(this, xcount), 500)); // wait till 500ms for next click
        return this.count;
      }

      reset_count(n: number) {
        // Reset count if clicked on the different side
        this.reseted = this.count;
        this.count = n;
        for (var i = 0; i < this.timers.length; i++) {
          clearTimeout(this.timers[i]);
        }
        this.timer = [];
      }

      reset(xcount: number) {
        if (this.count > xcount) {
          return;
        } // return if clicked after timer started
        // Reset otherwise
        this.count = 0;
        this.last_side = null;
        this.reseted = 0;
        skip_ol.style.opacity = '0';
        this.timer = [];
      }
    }

    var counter = new multiclick_counter();

    const poster = byClass('plyr__poster')[0];
    poster.onclick = function (e: {
      target: { getBoundingClientRect: () => any; offsetWidth: any };
      clientX: number;
    }) {
      const count = counter.clicked();
      if (count < 2) {
        return;
      } // if not double click

      const rect = e.target.getBoundingClientRect();
      const x = e.clientX - rect.left; //x position within the element.

      // The relative position of click on video
      const width = e.target.offsetWidth;
      const perc = (x * 100) / width;

      var panic = true; // panic if the side needs to be checked
      var last_click = counter.last_side;

      if (last_click == null) {
        panic = false;
      }

      if (perc < 40) {
        if (player.currentTime == 0) {
          return; // won't seek beyond 0
        }
        // @ts-ignore
        counter.last_side = 'L';
        if (panic && last_click != 'L') {
          counter.reset_count(1);
          return;
        }

        skip_ol.style.opacity = '0.9';
        player.rewind();
        skip_ol.innerHTML =
          '<i class="fa-solid fa-backward"></i> ' + (count - 1) * 10 + 's';
      } else if (perc > 60) {
        if (player.currentTime == player.duration) {
          return; // won't seek beyond duration
        }
        // @ts-ignore
        counter.last_side = 'R';
        if (panic && last_click != 'R') {
          counter.reset_count(1);
          return;
        }

        skip_ol.style.opacity = '0.9';
        // @ts-ignore
        last_click = 'R';
        player.forward();
        skip_ol.innerHTML =
          '<i class="fa-solid fa-forward"></i> ' + (count - 1) * 10 + 's';
      } else {
        player.togglePlay();
        counter.last_click = 'C';
      }
    };
  }

  useEffect(() => {
    if (lastMessage !== null) {
      const playerEvent = JSON.parse(lastMessage.data) as PlayerEvent;
      const player = playerRef.current;

      if (playerEvent.user === user && playerEvent.event !== 'play-video')
        return;

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
        case 'play-video':
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
    }
  }, [lastMessage]);

  useEffect(() => {
    console.log('Socket Readystate:', readyState);
    if (readyState === ReadyState.OPEN) {
      // Sync request
      sendPlayerEventToServer('sync', 0, null);

      // Default video
      setTimeout(() => {
        initPlayer(
          'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4',
        );
      }, 200);
    }
  }, [readyState]);

  return (
    <div className='relative z-[1]'>
      {error && <p className='pb-5 text-red-500'>{error}</p>}
      <canvas ref={canvasRef} className='decoy'></canvas>
      <video id='player' className='plyr-react plyr' playsInline />
    </div>
  );
};

export default React.memo(PlyrVideoPlayer);

import React, { useEffect, useRef } from 'react';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';

const PlyrVideoPlayer: React.FC = () => {
  // Temp for development
  const user = (Math.random() + 1).toString(36).substring(7);
  let sendEvent = true;

  // Toggle player ambient mode
  const ambientMode = true;
  let player = null;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ws = useRef<WebSocket | null>(null);

  const setCanvasDimension = (
    canvas: HTMLCanvasElement,
    video: HTMLVideoElement,
  ) => {
    canvas.height = video.offsetHeight;
    canvas.width = video.offsetWidth;
  };

  const paintStaticVideo = (
    ctx: CanvasRenderingContext2D,
    video: HTMLVideoElement,
  ) => {
    if (!ambientMode) {
      return;
    }
    ctx.drawImage(video, 0, 0, video.offsetWidth, video.offsetHeight);
  };

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

    const videoSource = {
      type: 'video',
      sources: [
        {
          src: source,
          type: 'video/mp4',
          size: 1080,
        },
      ],
    };

    // Set Player video source
    player.source = videoSource as Plyr.SourceInfo;

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

      if (sendEvent) {
        ws.current?.send(
          JSON.stringify({ event: 'play', time: currentTime, user: user }),
        );
      }
    });

    // Event Listener for pause event
    player.on('pause', () => {
      const currentTime = player.currentTime;
      console.log('Video stopped at ' + currentTime);

      if (sendEvent) {
        ws.current?.send(
          JSON.stringify({ event: 'pause', time: currentTime, user: user }),
        );
      }
    });

    // Event Listener for seeked event
    player.on('seeked', () => {
      const currentTime = player.currentTime;
      console.log('Video seeked to ' + currentTime);
      paintStaticVideo(ctx!, video);

      if (sendEvent) {
        ws.current?.send(
          JSON.stringify({ event: 'seeked', time: currentTime, user: user }),
        );
      }
    });
  };

  useEffect(() => {
    // Initialize WebSocket connection
    ws.current = new WebSocket('ws://127.0.0.1:3003/video');

    ws.current.onopen = () => {
      console.log('WebSocket connection opened');
    };

    // Default video
    initPlayer(
      'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4',
    );

    ws.current.onmessage = event => {
      const message = JSON.parse(event.data);

      if (message.event == 'add-video') {
        // Destroy old Player instance
        if (player != null) {
          player.destroy();
        }

        // Re-init Player with new video url
        initPlayer(message.url);
        console.log('Now Playing: ' + message.url);
      }

      if (message.event == 'play' && message.user != user) {
        console.log('Received Play Event');
        sendEvent = false;
        player.currentTime = message.time;
        player.play();
        setTimeout(() => {
          sendEvent = true;
        }, 500);
      }

      if (message.event == 'pause' && message.user != user) {
        console.log('Received Pause Event');
        sendEvent = false;
        player.currentTime = message.time;
        player.pause();
        setTimeout(() => {
          sendEvent = true;
        }, 500);
      }

      if (message.event == 'seeked' && message.user != user) {
        console.log('Received Seeked Event');
        sendEvent = false;
        player.currentTime = message.time;
        setTimeout(() => {
          sendEvent = true;
        }, 500);
      }

      console.log('WebSocket Server Message: ' + event.data);
    };

    // Event Listener for timeupdate event
    // Not sure if we want to send this data to the websocket,
    // as it will cause a lot of network traffic
    // player.on('timeupdate', () => {
    //   var currentTime = player.currentTime;
    //   console.log('Video currently at ' + currentTime);
    // });

    ws.current.onclose = () => {
      console.log('WebSocket connection closed');
    };

    ws.current.onerror = error => {
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

export default PlyrVideoPlayer;

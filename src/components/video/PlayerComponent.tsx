import React, { useRef, useEffect } from 'react';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';

interface PlayerComponentProps {
  source: {
    type: string;
    sources: {
      src: string;
      type: string;
      size?: number;
    }[];
  };
}

const PlyrVideoPlayer: React.FC<PlayerComponentProps> = ({ source }) => {
  // Toggle player ambient mode
  var ambientMode = true;

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const setCanvasDimension = (canvas: HTMLCanvasElement, video: HTMLVideoElement) => {
    canvas.height = video.offsetHeight;
    canvas.width = video.offsetWidth;
  };

  const paintStaticVideo = (ctx: CanvasRenderingContext2D, video: HTMLVideoElement) => {
    if (!ambientMode) {
      return;
    }
    ctx.drawImage(video, 0, 0, video.offsetWidth, video.offsetHeight);
  };

  useEffect(() => {
    // Init Player
    const player = new Plyr(videoRef.current!, {
      controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen']
    });

    // Set Player video source
    player.source = source as Plyr.SourceInfo;

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
      
      var currentTime = player.currentTime;
      console.log('Video started at ' + currentTime);
    });

    // Event Listener for pause event
    player.on('pause', () => {
      var currentTime = player.currentTime;
      console.log('Video stopped at ' + currentTime);
    });

    // Event Listener for seeked event
    player.on('seeked', () => {
      var currentTime = player.currentTime;
      console.log('Video seeked to ' + currentTime);
      paintStaticVideo(ctx!, video);
    });

    // Event Listener for timeupdate event
    // Not sure if we want to send this data to the websocket,
    // as it will cause a lot of network traffic
    // player.on('timeupdate', () => {
    //   var currentTime = player.currentTime;
    //   console.log('Video currently at ' + currentTime);
    // });
    
  }, [source]);

  return (
    <div>
      <canvas ref={canvasRef} className="decoy"></canvas>
      <video ref={videoRef} className="plyr-react plyr" playsInline />
    </div>
  );
};

export default PlyrVideoPlayer;

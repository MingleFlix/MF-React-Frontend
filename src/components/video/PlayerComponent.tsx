// PlyrVideoPlayer.tsx
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
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const player = new Plyr(videoRef.current!, {
      controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen']
    });

    player.source = source as Plyr.SourceInfo;

    // Event Listener for play event
    player.on('play', () => {
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
    <div className=''>
      <video ref={videoRef} className="plyr-react plyr" playsInline />
    </div>
  );
};

export default PlyrVideoPlayer;

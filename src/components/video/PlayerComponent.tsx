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
    
  }, [source]);

  return (
    <div className=''>
      <video ref={videoRef} className="plyr-react plyr" playsInline />
    </div>
  );
};

export default PlyrVideoPlayer;

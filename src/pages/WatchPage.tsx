import Plyr from 'plyr';
import PlayerComponent from '../components/video/PlayerComponent';

export function WatchPage() {
  const videoSource = {
    type: 'video',
    sources: [
      {
        src: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4',
        type: 'video/mp4',
        size: 1080,
      },
    ],
  };

  return (
    <div className='bg-neutral-900'>
      <section id='about' className='h-screen' style={{ padding: '20px 50px' }}>
        <div className='container h-[90vh] px-6 pt-[65px]'>
          <PlayerComponent source={videoSource}></PlayerComponent>    
        </div>
      </section>
    </div>
  );
}

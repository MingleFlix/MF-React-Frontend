import PlayerComponent from './video/PlayerComponent';
import AddVideoInput from './video/AddVideoInput';
import VideoQueueComponent from './video/VideoQueueComponent';

export function WatchComponent(props: { roomId: string }) {
  return (
    <section id='about' className='h-[95vh]' style={{ padding: '20px 50px' }}>
      <div className='h-[90vh] pt-[65px]'>
        <div className='flex flex-col xl:flex-row justify-center'>
          <div className='pt-2 space-y-6 max-w-[100%] xl:max-w-[90%] 2xl:max-w-[70%] min-w-[50%]'>
            <AddVideoInput roomId={props.roomId}></AddVideoInput>
            <PlayerComponent roomId={props.roomId}></PlayerComponent>
          </div>
          <div className='flex flex-col'>
            <VideoQueueComponent></VideoQueueComponent>
          </div>
        </div>
      </div>
    </section>
  );
}

import AddVideoInput from './video/AddVideoInput';
import PlayerComponent from './video/PlayerComponent';
import VideoQueueComponent from './video/VideoQueueComponent';
import { Chat } from '@/pages/Room/components/Chat.tsx';

export function WatchComponent(props: { roomId: string }) {
  return (
    <section id='about' className='h-[95vh]' style={{ padding: '20px 50px' }}>
      <div className='h-[90vh] pt-[65px]'>
        <div className='flex flex-col justify-center gap-5'>
          <div className='flex gap-5'>
            <div className='flex-1 max-w-[100%] xl:max-w-[90%] 2xl:max-w-[70%] min-w-[50%]'>
              <PlayerComponent roomId={props.roomId}></PlayerComponent>
            </div>
            {/*<Chat roomId={props.roomId} />*/}
          </div>
          <div className='ml-4 flex flex-col'>
            <AddVideoInput roomId={props.roomId}></AddVideoInput>
            <VideoQueueComponent roomId={props.roomId}></VideoQueueComponent>
          </div>
        </div>
      </div>
    </section>
  );
}

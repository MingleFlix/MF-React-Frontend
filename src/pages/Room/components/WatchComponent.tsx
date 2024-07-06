import AddVideoInput from './video/AddVideoInput';
import PlyrPlayerComponent from './video/PlyrPlayerComponent';
import VideoQueueComponent from './video/VideoQueueComponent';
import { Chat } from '@/pages/Room/components/Chat.tsx';

export function WatchComponent(props: { roomId: string }) {
  return (
    <section id='about' className='h-[95vh]' style={{ padding: '20px 50px' }}>
      <div className='h-[90vh] pt-[65px]'>
        <div className='flex flex-col gap-5 justify-center'>
          <div className='flex gap-5'>
            <div className='flex-1 max-w-[100%] xl:max-w-[90%] 2xl:max-w-[70%] min-w-[50%]'>
              <PlyrPlayerComponent roomId={props.roomId} />
            </div>
            <Chat roomId={props.roomId} />
          </div>
          <div className='flex flex-col ml-4'>
            <AddVideoInput roomId={props.roomId}></AddVideoInput>
            <VideoQueueComponent roomId={props.roomId}></VideoQueueComponent>
          </div>
        </div>
      </div>
    </section>
  );
}

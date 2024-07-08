import AddVideoInput from './video/AddVideoInput';
import PlyrPlayerComponent from './video/PlyrPlayerComponent';
import VideoQueueComponent from './video/VideoQueueComponent';
import { Chat } from '@/pages/Room/components/Chat.tsx';

/*
 * Author: Jesse Günzl
 * Matrikelnummer: 2577166
 *
 * Author: Alexandre Kaul
 * Matrikelnummer: 2552912
 */

export function WatchComponent(props: { roomId: string }) {
  return (
    <section id='about' className='h-[95vh] p-0 md:p-10'>
      <div className='h-[90vh] '>
        <div className='flex flex-col gap-5 xl:flex-row'>
          <div className='max-w-[100%] xl:max-w-[90%] 2xl:max-w-[70%] md:min-w-[50%]'>
            <PlyrPlayerComponent roomId={props.roomId} />
          </div>
          <div className='flex flex-col'>
            <Chat roomId={props.roomId} />
            <AddVideoInput roomId={props.roomId} />
            <VideoQueueComponent roomId={props.roomId} />
          </div>
        </div>
      </div>
    </section>
  );
}

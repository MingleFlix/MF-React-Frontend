import React from 'react';

interface QueueItem {
  user: string;
  url: string;
}

const VideoQueueComponent: React.FC = () => {
  const queueItems: QueueItem[] = [];
  queueItems.push({ user: 'Test', url: 'some random url' });

  return (
    <div className='pt-2 sm:px-2 lg:px-4 2xl:w-[450px] !z-[0]'>
      <div className='relative mb-6 bg-[#292929] border-sky-600 border-b-[2px] rounded-lg'>
        <div className='p-[14px]'>
          <p className='leading-normal text-lg font-bold text-white pb-2'>
            Queue
          </p>
        </div>
        <div className='overflow-scroll min-h-[150px] max-h-[67vh] bg-neutral-950/50 m-1 rounded-lg'>
          <div className='grid grid-cols-1 gap-2'>
            {queueItems.map((item, index) => {
              return (
                <a href='#' key={index}>
                  <div className='flex flex-row hover:bg-sky-800/30 bg-sky-800/10 rounded-lg px-4'>
                    <div className='w-10 h-14 flex items-center text-white pl-1'>
                      <p>⮞</p>
                    </div>
                    <div className='basis-3/4 pl-2'>
                      <p className='text-white text-sm font-bold'>{item.url}</p>
                      <p className='text-white text-sm font-medium'>
                        added by {item.user}
                      </p>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoQueueComponent;

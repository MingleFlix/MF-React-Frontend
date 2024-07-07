import { AuthContext } from '@/context/AuthContext';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import z from 'zod';

const BroadcastMessageEventSchema = z.object({
  type: z.literal('broadcast'),
  timestamp: z.string().datetime(),
  name: z.string(),
  userId: z.string().or(z.number()),
  email: z.string(),
  message: z.string(),
});

type BroadcastMessageEvent = z.infer<typeof BroadcastMessageEventSchema>;

type ChatEntry =
  | {
      type: 'system';
      timestamp: Date;
      message: string;
    }
  | BroadcastMessageEvent;

export type ChatProps = {
  roomId?: string | null;
};

export function Chat({ roomId }: ChatProps) {
  const authContext = useContext(AuthContext);

  const token = authContext.auth?.token;

  const messageContainerRef = useRef<HTMLDivElement>(null);

  const [input, setInput] = useState('');

  const socketUrl = useMemo(
    () => `/api/chat?token=${token}&roomID=${roomId}`,
    [token, roomId],
  );

  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    socketUrl,
    {
      shouldReconnect: _closeEvent => true,
    },
  );

  const [messages, setMessages] = useState<ChatEntry[]>([]);

  const pushBroadcastEvent = (event: BroadcastMessageEvent) =>
    setMessages(messages => [...messages, event]);

  const pushSystemEvent = (message: string) =>
    setMessages(messages => [
      ...messages,
      { type: 'system', timestamp: new Date(), message },
    ]);

  useMemo(() => {
    if (!lastJsonMessage) {
      return;
    }

    const parseResult = BroadcastMessageEventSchema.safeParse(lastJsonMessage);
    if (!parseResult.success) {
      console.error('invalid message', parseResult);
      return;
    }

    pushBroadcastEvent(parseResult.data);
  }, [lastJsonMessage]);

  useMemo(() => {
    switch (readyState) {
      case ReadyState.OPEN:
        pushSystemEvent('Connected.');
        break;
      case ReadyState.CONNECTING:
        pushSystemEvent('Connecting.');
        break;
      case ReadyState.CLOSED:
        pushSystemEvent('Disconnected.');
        break;
    }
  }, [readyState]);

  const sendMessage = () => {
    if (!input) {
      return;
    }

    sendJsonMessage(
      {
        type: 'message',
        message: input,
      },
      false,
    );

    setInput('');
  };

  // Auto scroll.
  useEffect(() => {
    if (!messageContainerRef.current) {
      return;
    }
    messageContainerRef.current.scrollTo({
      top: messageContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  return (
    <div
      className={`flex rounded-lg flex-col p-2 min-w-[20rem] 2xl:w-[450px] border-b-[2px] mb-6 bg-[#292929] gap-2 text-left ${readyState !== ReadyState.OPEN ? 'border-red-600 hover:border-red-400' : 'border-sky-600 hover:border-sky-400'}`}
    >
      <div
        className='flex flex-col gap-1 h-[20rem] p-1 overflow-y-auto bg-neutral-950/50  rounded-lg'
        ref={messageContainerRef}
      >
        {messages.map((message, index) => {
          const ts = new Date(message.timestamp);
          return (
            <div
              className='flex flex-col p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700'
              key={index}
            >
              <div className='flex gap-1 text-xs font-bold text-gray-400'>
                <span>{`${ts.getHours()}:${ts.getMinutes()}:${ts.getSeconds()}`}</span>
              </div>
              {message.type === 'system' && (
                <div className='text-gray-400 break-all'>
                  <span className='text-xs font-bold text-green-600'>
                    System
                  </span>{' '}
                  {message.message}
                </div>
              )}
              {message.type === 'broadcast' && (
                <div className='text-gray-400 break-all'>
                  <span className='text-xs font-bold text-gray-300'>
                    @{message.name}
                  </span>{' '}
                  {message.message}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className='flex flex-col gap-2'>
        <input
          type='text'
          className='rounded bg-neutral-900 h-[2.5rem] px-2 py-1 w-full focus:outline-none text-white/80'
          multiple
          value={input}
          placeholder='Type message here...'
          onChange={e => setInput(e.target.value)}
        />
        <button
          type='button'
          className='p-1 text-white bg-neutral-700 hover:bg-neutral-600'
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}

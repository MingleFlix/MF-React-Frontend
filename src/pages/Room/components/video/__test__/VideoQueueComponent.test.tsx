import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthContext } from '@/context/AuthContext';
import useWebSocket from 'react-use-websocket';
import '@testing-library/jest-dom';
import VideoQueueComponent from '../VideoQueueComponent';
import { QueueEvent } from '@/types/events';

/*
 * Author: Alexandre Kaul
 * Matrikelnummer: 2552912
 */

// Mock the useWebSocket hook
jest.mock('react-use-websocket', () => ({
  __esModule: true,
  default: jest.fn(),
  ReadyState: {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
  },
}));

// Mock auth context
const mockAuthContext = {
  auth: {
    username: 'testuser',
    token: 'testtoken',
    role: '',
    userId: '',
    email: '',
  },
  login: () => {},
  logout: () => {},
  loading: false,
};

describe('Video Queue Component', () => {
  const mockSendMessage = jest.fn();
  const mockUseWebSocket = useWebSocket as jest.MockedFunction<
    typeof useWebSocket
  >;

  beforeEach(() => {
    mockUseWebSocket.mockReturnValue({
      sendMessage: mockSendMessage,
      readyState: 1, // ReadyState.OPEN
      lastMessage: null,
      sendJsonMessage: jest.fn(),
      getWebSocket: jest.fn(),
      lastJsonMessage: null,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders queue component', () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <VideoQueueComponent roomId='test-room'></VideoQueueComponent>
      </AuthContext.Provider>,
    );

    expect(screen.getByText('Queue')).toBeInTheDocument();
  });

  it('renders queue component with an empty queue', () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <VideoQueueComponent roomId='test-room' />
      </AuthContext.Provider>,
    );

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.queryByText('added by')).not.toBeInTheDocument();
  });

  it('updates queue when receiving a socket message', async () => {
    const mockQueueEvent: QueueEvent = {
      event: 'sync-ack-queue',
      items: [
        { user: 'user1', url: 'http://example.com/video1', active: false },
        { user: 'user2', url: 'http://example.com/video2', active: true },
      ],
      room: 'test-room',
    };

    mockUseWebSocket.mockReturnValue({
      sendMessage: mockSendMessage,
      readyState: 1,
      lastMessage: {
        data: JSON.stringify(mockQueueEvent),
        lastEventId: '',
        origin: '',
        ports: [],
        source: undefined,
        initMessageEvent: function (
          _type: string,
          _bubbles?: boolean,
          _cancelable?: boolean,
          _data?: any,
          _origin?: string,
          _lastEventId?: string,
          _source?: MessageEventSource,
          _ports?: MessagePort[],
        ): void {
          throw new Error('Function not implemented.');
        },
        bubbles: false,
        cancelBubble: false,
        cancelable: false,
        composed: false,
        currentTarget: undefined,
        defaultPrevented: false,
        eventPhase: 0,
        isTrusted: false,
        returnValue: false,
        srcElement: undefined,
        target: undefined,
        timeStamp: 0,
        type: '',
        composedPath: function (): EventTarget[] {
          throw new Error('Function not implemented.');
        },
        initEvent: function (): void {
          throw new Error('Function not implemented.');
        },
        preventDefault: function (): void {
          throw new Error('Function not implemented.');
        },
        stopImmediatePropagation: function (): void {
          throw new Error('Function not implemented.');
        },
        stopPropagation: function (): void {
          throw new Error('Function not implemented.');
        },
        NONE: 0,
        CAPTURING_PHASE: 1,
        AT_TARGET: 2,
        BUBBLING_PHASE: 3,
      },
      sendJsonMessage: jest.fn(),
      getWebSocket: jest.fn(),
      lastJsonMessage: null,
    });

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <VideoQueueComponent roomId='test-room' />
      </AuthContext.Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText('http://example.com/video1')).toBeInTheDocument();
      expect(screen.getByText('added by user1')).toBeInTheDocument();
      expect(screen.getByText('http://example.com/video2')).toBeInTheDocument();
      expect(screen.getByText('added by user2')).toBeInTheDocument();
    });
  });

  it('handles play video action', async () => {
    const mockQueueEvent: QueueEvent = {
      event: 'sync-ack-queue',
      items: [
        { user: 'user1', url: 'http://example.com/video1', active: false },
      ],
      room: 'test-room',
    };

    mockUseWebSocket.mockReturnValue({
      sendMessage: mockSendMessage,
      readyState: 1,
      lastMessage: {
        data: JSON.stringify(mockQueueEvent),
        lastEventId: '',
        origin: '',
        ports: [],
        source: undefined,
        initMessageEvent: function (
          _type: string,
          _bubbles?: boolean,
          _cancelable?: boolean,
          _data?: any,
          _origin?: string,
          _lastEventId?: string,
          _source?: MessageEventSource,
          _ports?: MessagePort[],
        ): void {
          throw new Error('Function not implemented.');
        },
        bubbles: false,
        cancelBubble: false,
        cancelable: false,
        composed: false,
        currentTarget: undefined,
        defaultPrevented: false,
        eventPhase: 0,
        isTrusted: false,
        returnValue: false,
        srcElement: undefined,
        target: undefined,
        timeStamp: 0,
        type: '',
        composedPath: function (): EventTarget[] {
          throw new Error('Function not implemented.');
        },
        initEvent: function (
          _type: string,
          _bubbles?: boolean,
          _cancelable?: boolean,
        ): void {
          throw new Error('Function not implemented.');
        },
        preventDefault: function (): void {
          throw new Error('Function not implemented.');
        },
        stopImmediatePropagation: function (): void {
          throw new Error('Function not implemented.');
        },
        stopPropagation: function (): void {
          throw new Error('Function not implemented.');
        },
        NONE: 0,
        CAPTURING_PHASE: 1,
        AT_TARGET: 2,
        BUBBLING_PHASE: 3,
      },
      sendJsonMessage: jest.fn(),
      getWebSocket: jest.fn(),
      lastJsonMessage: null,
    });

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <VideoQueueComponent roomId='test-room' />
      </AuthContext.Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText('http://example.com/video1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('http://example.com/video1'));

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith(
        JSON.stringify({
          room: 'test-room',
          event: 'play-video',
          user: 'testuser',
          time: 0,
          url: 'http://example.com/video1',
        }),
      );
    });
  });

  it('handles delete video action', async () => {
    const mockQueueEvent: QueueEvent = {
      event: 'sync-ack-queue',
      items: [
        { user: 'user1', url: 'http://example.com/video1', active: false },
      ],
      room: 'test-room',
    };

    mockUseWebSocket.mockReturnValue({
      sendMessage: mockSendMessage,
      readyState: 1,
      lastMessage: {
        data: JSON.stringify(mockQueueEvent),
        lastEventId: '',
        origin: '',
        ports: [],
        source: undefined,
        initMessageEvent: function (
          _type: string,
          _bubbles?: boolean,
          _cancelable?: boolean,
          _data?: any,
          _origin?: string,
          _lastEventId?: string,
          _source?: MessageEventSource,
          _ports?: MessagePort[],
        ): void {
          throw new Error('Function not implemented.');
        },
        bubbles: false,
        cancelBubble: false,
        cancelable: false,
        composed: false,
        currentTarget: undefined,
        defaultPrevented: false,
        eventPhase: 0,
        isTrusted: false,
        returnValue: false,
        srcElement: undefined,
        target: undefined,
        timeStamp: 0,
        type: '',
        composedPath: function (): EventTarget[] {
          throw new Error('Function not implemented.');
        },
        initEvent: function (
          _type: string,
          _bubbles?: boolean,
          _cancelable?: boolean,
        ): void {
          throw new Error('Function not implemented.');
        },
        preventDefault: function (): void {
          throw new Error('Function not implemented.');
        },
        stopImmediatePropagation: function (): void {
          throw new Error('Function not implemented.');
        },
        stopPropagation: function (): void {
          throw new Error('Function not implemented.');
        },
        NONE: 0,
        CAPTURING_PHASE: 1,
        AT_TARGET: 2,
        BUBBLING_PHASE: 3,
      },
      sendJsonMessage: jest.fn(),
      getWebSocket: jest.fn(),
      lastJsonMessage: null,
    });

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <VideoQueueComponent roomId='test-room' />
      </AuthContext.Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText('http://example.com/video1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('✕'));

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith(
        JSON.stringify({
          room: 'test-room',
          event: 'delete-video',
          user: 'testuser',
          time: 0,
          url: 'http://example.com/video1',
        }),
      );
    });
  });

  it('displays loading state when WebSocket is not open', async () => {
    mockUseWebSocket.mockReturnValue({
      sendMessage: mockSendMessage,
      readyState: 3,
      lastMessage: null,
      sendJsonMessage: jest.fn(),
      getWebSocket: jest.fn(),
      lastJsonMessage: null,
    });

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <VideoQueueComponent roomId='test-room' />
      </AuthContext.Provider>,
    );

    await waitFor(() =>
      expect(screen.getByText('Loading...')).toBeInTheDocument(),
    );
  });
});

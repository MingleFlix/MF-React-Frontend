import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthContext } from '@/context/AuthContext';
import useWebSocket from 'react-use-websocket';
import AddVideoInput from '../AddVideoInput';
import '@testing-library/jest-dom';

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

describe('Add Video Input Component', () => {
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

  it('renders input field', () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <AddVideoInput roomId='test-room' />
      </AuthContext.Provider>,
    );

    expect(screen.getByPlaceholderText('Add Video URL')).toBeInTheDocument();
  });

  it('handles input change', () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <AddVideoInput roomId='test-room' />
      </AuthContext.Provider>,
    );

    const inputElement = screen.getByPlaceholderText('Add Video URL');
    fireEvent.change(inputElement, { target: { value: 'http://example.com' } });
    expect(inputElement).toHaveValue('http://example.com');
  });

  it('sends message on Enter key press', () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <AddVideoInput roomId='test-room' />
      </AuthContext.Provider>,
    );

    const inputElement = screen.getByPlaceholderText('Add Video URL');
    fireEvent.change(inputElement, { target: { value: 'http://example.com' } });
    fireEvent.keyDown(inputElement, { key: 'Enter', code: 'Enter' });

    expect(mockSendMessage).toHaveBeenCalledWith(
      JSON.stringify({
        room: 'test-room',
        event: 'add-video',
        user: 'testuser',
        time: 0,
        url: 'http://example.com',
      }),
    );
  });

  it('displays an error message on failed server connection', async () => {
    mockUseWebSocket.mockReturnValueOnce({
      sendMessage: mockSendMessage,
      readyState: 3, // ReadyState.CLOSED
      lastMessage: null,
      sendJsonMessage: jest.fn(),
      getWebSocket: jest.fn(),
      lastJsonMessage: null,
    });

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <AddVideoInput roomId='test-room' />
      </AuthContext.Provider>,
    );

    await waitFor(() =>
      expect(
        screen.getByPlaceholderText('No connection to server!'),
      ).toBeInTheDocument(),
    );
  });
});

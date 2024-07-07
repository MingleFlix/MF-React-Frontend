import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthContext } from '@/context/AuthContext';
import { Login } from '../Login';
import '@testing-library/jest-dom';

/*
 * Author: Alexandre Kaul
 * Matrikelnummer: 2552912
 */

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

// Mocking fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ token: 'test-token' }),
  }),
) as jest.Mock;

describe('Login component', () => {
  it('renders login form', () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <Login />
      </AuthContext.Provider>,
    );

    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByText('Sign in')).toBeInTheDocument();
  });

  it('handles form input correctly', () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <Login />
      </AuthContext.Provider>,
    );

    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('submits the form successfully', async () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <Login />
      </AuthContext.Provider>,
    );

    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByText('Sign in');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    fireEvent.click(submitButton);

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith('/api/user-management/login', {
        body: '{"email":"test@example.com","password":"password123"}',
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      }),
    );
    await waitFor(() =>
      expect(screen.getByText('Login successful!')).toBeInTheDocument(),
    );
  });

  it('displays an error message on failed login', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
      }),
    );

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <Login />
      </AuthContext.Provider>,
    );

    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByText('Sign in');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() =>
      expect(
        screen.getByText('Login failed. Please try again.'),
      ).toBeInTheDocument(),
    );
  });
});

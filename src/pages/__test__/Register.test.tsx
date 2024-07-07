import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthContext } from '@/context/AuthContext';
import { Register } from '../Register';
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

describe('Register component', () => {
  it('renders register form', () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <Register />
      </AuthContext.Provider>,
    );

    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByText('Already registered?')).toBeInTheDocument();
    expect(screen.getAllByText('Register')).toHaveLength(2);
  });

  it('handles form input correctly', () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <Register />
      </AuthContext.Provider>,
    );

    const userInput = screen.getByPlaceholderText('Username');
    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password');

    fireEvent.change(userInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(userInput).toHaveValue('testuser');
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('submits the form successfully', async () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <Register />
      </AuthContext.Provider>,
    );

    const userInput = screen.getByPlaceholderText('Username');
    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getAllByText('Register')[1];

    fireEvent.change(userInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    fireEvent.click(submitButton);

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith('/api/user-management/register', {
        body: '{"username":"testuser","email":"test@example.com","password":"password123"}',
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      }),
    );
    await waitFor(() =>
      expect(
        screen.getByText('Successfully registered. You may now login!'),
      ).toBeInTheDocument(),
    );
  });

  it('displays an error message on failed register', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
      }),
    );

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <Register />
      </AuthContext.Provider>,
    );

    const userInput = screen.getByPlaceholderText('Username');
    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getAllByText('Register')[1];

    fireEvent.change(userInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() =>
      expect(
        screen.getByText('Registration failed. Please try again.'),
      ).toBeInTheDocument(),
    );
  });
});

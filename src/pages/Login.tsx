import React, { useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from '@/context/AuthContext.tsx';

interface FormData {
  email: string;
  password: string;
}

interface AuthResponseData {
  email: string;
  exp: number;
  iat: number;
  userId: string;
}

export function Login() {
  const authContext = useContext(AuthContext);
  const [formData, setFormData] = React.useState<FormData>({
    email: '',
    password: '',
  });

  const [error, setError] = React.useState<string>('');
  const [success, setSuccess] = React.useState<string>('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  if (!authContext) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  const { login } = authContext;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await fetch('/api/user-management/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to login');
      }

      // The response is a readable stream, therefore we have to wait
      const responseBody = await response.json();

      const token = responseBody.token;
      // Throws InvalidTokenError, this way we check if it is even a valid token
      const decodedToken = jwtDecode(token) as AuthResponseData;

      // Convert cookie expire (*1000 as the unixtimestamp needs to be in ms)
      const expireDate = new Date(decodedToken.exp * 1000);

      login(token, decodedToken.userId, expireDate);
      // Clear form fields on successful login
      setFormData({
        email: '',
        password: '',
      });

      setError('');
      setSuccess('Login successful!');
    } catch (error: any) {
      setError('Login failed. Please try again.');
      setSuccess('');
    }
  };

  return (
    <div className='bg-neutral-900'>
      <section className='h-screen'>
        <div className='container h-[90vh] px-6 pt-[65px]'>
          <div className='flex h-[90%] flex-wrap content-center justify-center'>
            <div className='md:w-8/12 lg:ms-6 lg:w-[450px]'>
              <form
                className='p-10 bg-[#292929] rounded-lg'
                onSubmit={handleSubmit}
              >
                <h2 className='text-4xl text-white p-5 pb-10'>Login</h2>
                {error && <p className='pb-5 text-red-500'>{error}</p>}
                {success && <p className='pb-5 text-green-500'>{success}</p>}
                <div
                  className='relative mb-6 bg-neutral-900 border-sky-600 hover:border-sky-400 transition duration-400 ease-in-out border-b-[2px] rounded-lg'
                  data-twe-input-wrapper-init
                >
                  <input
                    type='email'
                    className='block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none text-white/80'
                    name='email'
                    value={formData.email}
                    onChange={handleChange}
                    placeholder='Email address'
                  />
                </div>

                <div
                  className='relative mb-6 bg-neutral-900 border-sky-600 hover:border-sky-400 transition duration-400 ease-in-out border-b-[2px] rounded-lg'
                  data-twe-input-wrapper-init
                >
                  <input
                    type='password'
                    className='block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none text-white/80'
                    name='password'
                    value={formData.password}
                    onChange={handleChange}
                    placeholder='Password'
                  />
                </div>

                <div className='mb-6 flex items-center justify-between float-right'>
                  <a href='#!' className='text-white'>
                    Forgot password?
                  </a>
                </div>

                <button
                  type='submit'
                  className='inline-block w-full rounded-lg bg-primary px-7 pb-2.5 pt-3 text-sm font-medium uppercase leading-normal bg-sky-600 text-white shadow-primary-3 transition duration-400 ease-in-out hover:bg-sky-500 hover:shadow-primary-2 focus:bg-sky-500 focus:shadow-primary-2 focus:outline-none focus:ring-0 active:bg-sky-500 active:shadow-primary-2'
                >
                  Sign in
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

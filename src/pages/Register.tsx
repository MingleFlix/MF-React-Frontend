import React from 'react';

interface FormData {
  username: string;
  email: string;
  password: string;
}

export function Register() {
  const [formData, setFormData] = React.useState<FormData>({
    username: '',
    email: '',
    password: '',
  });

  const [error, setError] = React.useState<string>('');
  const [success, setSuccess] = React.useState<string>('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await fetch('api/user-management/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to register');
      }

      // To-Do: Auto login

      // Clear form fields on successful registration
      setFormData({
        username: '',
        email: '',
        password: '',
      });

      setError('');
      setSuccess('Successfully registered. You may now login!');
    } catch (error: any) {
      setError('Registration failed. Please try again.');
      setSuccess('');
    }
  };

  return (
    <div className='p-4 bg-neutral-900'>
      <section className='h-screen'>
        <div className='container h-full px-6'>
          <div className='flex h-full flex-wrap items-center content-center justify-center'>
            <div className='md:w-8/12 lg:ms-6 lg:w-[450px]'>
              <form
                className='p-10 bg-[#292929] rounded-lg'
                onSubmit={handleSubmit}
              >
                <h2 className='text-4xl text-white p-5 pb-10'>Register</h2>
                {error && <p className='pb-5 text-red-500'>{error}</p>}
                {success && (
                  <p className='pb-5 text-green-500'>
                    <a href='/login'>{success}</a>
                  </p>
                )}
                <div
                  className='relative mb-6 bg-neutral-900 border-sky-600 hover:border-sky-400 transition duration-400 ease-in-out border-b-[2px] rounded-lg'
                  data-twe-input-wrapper-init
                >
                  <input
                    type='text'
                    className='block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none text-white/80'
                    name='username'
                    value={formData.username}
                    onChange={handleChange}
                    placeholder='Username'
                  />
                </div>

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
                  <a href='/login' className='text-white'>
                    Already registered?
                  </a>
                </div>

                <button
                  type='submit'
                  className='inline-block w-full rounded-lg bg-primary px-7 pb-2.5 pt-3 text-sm font-medium uppercase leading-normal bg-sky-600 text-white shadow-primary-3 transition duration-400 ease-in-out hover:bg-sky-500 hover:shadow-primary-2 focus:bg-sky-500 focus:shadow-primary-2 focus:outline-none focus:ring-0 active:bg-sky-500 active:shadow-primary-2'
                >
                  Register
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

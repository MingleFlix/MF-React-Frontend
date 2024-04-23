export function Register() {
  return (
    <div className='p-4 bg-neutral-900'>
      <section className='h-screen'>
        <div className='container h-full px-6'>
          <div className='flex h-full flex-wrap items-center content-center justify-center'>
            <div className='md:w-8/12 lg:ms-6 lg:w-[450px]'>
              <form className='p-10 bg-[#292929] rounded-lg'>
                <h2 className='text-4xl text-white p-5 pb-10'>Register</h2>
                <div
                  className='relative mb-6 bg-neutral-900 border-sky-600 hover:border-sky-400 transition duration-400 ease-in-out border-b-[2px] rounded-lg'
                  data-twe-input-wrapper-init
                >
                  <input
                    type='email'
                    className='block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none text-white/80'
                    id='email'
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
                    id='password'
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

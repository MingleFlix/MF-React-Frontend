export function Login() {
  return (
    <div className='p-4'>
      <h2>Login</h2>
      <form>
        <div className='flex gap-x-2'>
          <label>Email:</label>
          <input type='email' name='email' />
        </div>
        <div className='flex gap-x-2'>
          <label>Password:</label>
          <input type='password' name='password' />
        </div>
        <button type='submit'>Login</button>
      </form>
    </div>
  );
}

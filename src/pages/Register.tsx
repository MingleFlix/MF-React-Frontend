export function Register() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Register</h2>
      <form>
        <div className='flex gap-x-2'>
          <label>Email:</label>
          <input type='email' name='email' />
        </div>
        <div className='flex gap-x-2'>
          <label>Password:</label>
          <input type='password' name='password' />
        </div>
        <button type='submit'>Register</button>
      </form>
    </div>
  );
}

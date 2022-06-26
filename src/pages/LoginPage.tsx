import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { withAuthCheck } from '../components/withAuthCheck';
import AuthAPI from '../api/AuthAPI';
import ErrorAlert from '../components/ErrorAlert';

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoaing] = useState(false);

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setEmailError('');
    setPasswordError('');
    setGeneralError('');

    const timeoutError = (errorSetter: React.Dispatch<React.SetStateAction<string>>, errorMessage: string) => {
      errorSetter(errorMessage);
      setTimeout(() => {
        errorSetter('');
      }, 5000);
    };

    if (!email) {
      timeoutError(setEmailError, 'Please provide Email');
    }
    if (!password) {
      timeoutError(setPasswordError, 'Please provide Password');
    }
    if (email && password) {
      setLoaing(true);
      AuthAPI.login(email, password)
        .then(() => {
          navigate('/');
        })
        .catch((err) => {
          timeoutError(setGeneralError, err.message);
          setLoaing(false);
        });
    }
  };

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-teal-900'>
      {(generalError || emailError || passwordError) && (
        <div className='fixed top-2 m-2 flex w-full max-w-sm flex-col gap-2'>
          {generalError && <ErrorAlert text={generalError} />}
          {emailError && <ErrorAlert text={emailError} />}
          {passwordError && <ErrorAlert text={passwordError} />}
        </div>
      )}
      <div className='flex flex-col items-center gap-8 lg:flex-row'>
        <div className='max-w-sm text-center lg:max-w-none lg:text-left'>
          <h1 className='text-4xl font-bold'>Login to</h1>
          <h1 className='mb-8 text-5xl font-bold'>fior-plants 🪴</h1>
          <p className='my-3'>To start using the fior-plants you need to log in.</p>
          <p className='my-3'>Don't worry we don't use your email for anything else than just authenticating you.</p>
          <p className='mt-3'>
            Haven't got an account yet?{' '}
            <Link to='/signup' className='link link-hover font-bold text-sky-500'>
              Sign up!
            </Link>
          </p>
        </div>
        <div className='flex w-full max-w-sm flex-shrink-0 flex-col gap-2 overflow-hidden rounded-2xl bg-slate-800 p-8 shadow-2xl'>
          <form onSubmit={handleLogin}>
            <div className='form-control'>
              <label className='label'>
                <span className='label-text'>Email</span>
              </label>
              <input type='email' placeholder='awesome@email.com' className='input input-bordered' onChange={(event) => setEmail(event.target.value)} />
            </div>
            <div className='form-control'>
              <label className='label'>
                <span className='label-text'>Password</span>
              </label>
              <input type='password' placeholder='S3cr3t_P4ssw0rd!' className='input input-bordered' onChange={(event) => setPassword(event.target.value)} />
            </div>
            <div className='form-control mt-16'>
              <button className='btn btn-success' type='submit' disabled={loading}>
                {loading ? (
                  <svg xmlns='http://www.w3.org/2000/svg' className='m-auto h-6 w-6 animate-spin' viewBox='0 0 24 24' stroke='currentColor' fill='currentColor'>
                    <path d='M12 22c5.421 0 10-4.579 10-10h-2c0 4.337-3.663 8-8 8s-8-3.663-8-8c0-4.336 3.663-8 8-8V2C6.579 2 2 6.58 2 12c0 5.421 4.579 10 10 10z' />
                  </svg>
                ) : (
                  <>Login</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default withAuthCheck(LoginPage, false);

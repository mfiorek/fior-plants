import { withAuthCheck } from '../components/withAuthCheck';
import { useAuth } from '../contexts/AuthContext';
import NavBar from '../components/NavBar';

function HomePage() {
  const auth = useAuth();

  return (
    <div className='flex min-h-screen flex-col bg-teal-800'>
      <NavBar />
      <div className='flex grow flex-col items-center justify-center gap-8'>
        <p className='text-6xl text-slate-300'>fior-plants 🪴</p>
        <p className='text-4xl text-slate-300'>Home page</p>
        <p className='text-4xl text-slate-300'>{auth.currentUser?.email}</p>
      </div>
    </div>
  );
}

export default withAuthCheck(HomePage, true);

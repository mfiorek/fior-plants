import { withAuthCheck } from '../components/withAuthCheck';
import { useAuth } from '../contexts/AuthContext';

function HomePage() {
  const auth = useAuth();

  return (
    <div className='flex h-screen flex-col items-center justify-center gap-8 bg-teal-900'>
      <p className='text-6xl text-slate-300'>fior-plants 🪴</p>
      <p className='text-4xl text-slate-300'>Home page</p>
      <p className='text-4xl text-slate-300'>{auth.currentUser?.email}</p>
    </div>
  );
}

export default withAuthCheck(HomePage, true);

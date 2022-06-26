import { useAuth } from '../contexts/AuthContext'

function HomePage() {
    const auth = useAuth();

    return (
      <div className='h-screen flex flex-col gap-8 justify-center items-center bg-teal-900'>
        <p className='text-6xl text-slate-300'>fior-plants 🪴</p>
        <p className='text-4xl text-slate-300'>Home page</p>
        <p className='text-4xl text-slate-300'>{auth.currentUser?.email}</p>
      </div>
    );
  }
  
  export default HomePage;
  
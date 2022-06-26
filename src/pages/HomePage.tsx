import { useEffect, useState } from 'react';
import { doc, DocumentData, onSnapshot } from 'firebase/firestore';
import { database } from '../firebase';
import { withAuthCheck } from '../components/withAuthCheck';
import { useAuth } from '../contexts/AuthContext';
import NavBar from '../components/NavBar';
import Loader from '../components/Loader';

function HomePage() {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<DocumentData | undefined>(undefined);

  // Subscribe to user data
  useEffect(() => {
    const userUnsubscribe = onSnapshot(doc(database, `users/${currentUser?.uid}`), (userData) => {
      setUserData(userData.data());
      setIsLoading(false);
    });
    return userUnsubscribe;
  }, []);

  return (
    <div className='flex min-h-screen flex-col bg-teal-800'>
      <NavBar />
      {isLoading ? (
        <Loader />
      ) : (
        <div className='flex grow flex-col items-center justify-center gap-4'>
          <p style={{fontSize: '20rem'}}>🪴</p>
          <p className='text-4xl text-slate-300'>Hi {userData?.name} 👋</p>
          <p className='text-4xl text-slate-300'>There is nothing here just yet...</p>
          <p className='text-4xl text-slate-300'>...but will be coming soon!</p>
        </div>
      )}
    </div>
  );
}

export default withAuthCheck(HomePage, true);

import { useEffect, useState } from 'react';
import { collection, doc, DocumentData, onSnapshot, QuerySnapshot } from 'firebase/firestore';
import { database } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';
import Loader from '../components/Loader';
import AddNewPlantModal from '../components/AddNewPlantModal';
import Plant from '../types/Plant';
import { calculateNextWatering } from '../utils/datesUtil';
import PlantCard from '../components/PlantCard';

function PlantsPage() {
  const { currentUser } = useAuth();
  const { openModal } = useModal();

  const [isUserLoading, setIsUserLoading] = useState(true);
  const [isPlantsLoading, setIsPlantsLoading] = useState(true);
  const [userData, setUserData] = useState<DocumentData | undefined>(undefined);
  const [plants, setPlants] = useState<Plant[]>();

  const isLoading = isUserLoading || isPlantsLoading;

  // Subscribe to user data
  useEffect(() => {
    const userUnsubscribe = onSnapshot(doc(database, `users/${currentUser?.uid}`), (userData) => {
      setUserData(userData.data());
      setIsUserLoading(false);
    });
    return userUnsubscribe;
  }, []);

  // Subscribe to plants data
  useEffect(() => {
    const plantsUnsubscribe = onSnapshot(collection(database, `users/${currentUser?.uid}/plants`), (plants: QuerySnapshot<DocumentData>) => {
      const plantsArray: Plant[] = [];
      plants.docs.forEach((plant) => {
        plantsArray.push({ id: plant.id, ...plant.data() } as Plant);
      });

      plantsArray.sort((plantA, plantB) => (calculateNextWatering(plantA)?.valueOf() || 0) - (calculateNextWatering(plantB)?.valueOf() || 0));
      setPlants(plantsArray);
      setIsPlantsLoading(false);
    });
    return plantsUnsubscribe;
  }, []);

  if (isLoading) return <Loader />;
  return (
    <div className='flex grow flex-col items-center gap-4'>
      <p className='select-none pt-8 text-9xl'>🪴</p>
      <p className='text-4xl text-slate-300'>Hi {userData?.name} 👋</p>
      <button onClick={() => openModal(<AddNewPlantModal />)} className='btn btn-info btn-wide'>
        Add new plant 🌱
      </button>
      <div className='flex flex-col gap-8 p-8 w-full lg:w-4/6'>
        {plants?.map((plant) => (
          <PlantCard plant={plant} />
        ))}
      </div>
    </div>
  );
}

export default PlantsPage;

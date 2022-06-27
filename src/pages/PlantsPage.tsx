import { useCallback, useEffect, useState } from 'react';
import { addDoc, collection, doc, DocumentData, increment, onSnapshot, QuerySnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';
import { database } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';
import Loader from '../components/Loader';
import AddNewPlantModal from '../components/AddNewPlantModal';
import Plant from '../types/Plant';
import { Link } from 'react-router-dom';

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

  const calculateNextWatering = useCallback((plant: Plant) => {
    if (!plant.lastWateringDate) return;
    const previousWatering = new Date(plant.lastWateringDate.toDate());
    const nextWatering = new Date(previousWatering.valueOf());
    nextWatering.setDate(previousWatering.getDate() + plant.wateringInterval);
    return nextWatering;
  }, []);

  const differenceInDays = useCallback((date1: Date | undefined, date2: Date | undefined) => {
    if (!date1 || !date2) return undefined;
    const diffTime = date2.valueOf() - date1.valueOf();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, []);

  const lastWateringText = useCallback((plant: Plant) => {
    const days = differenceInDays(new Date(), plant.lastWateringDate?.toDate());
    if (days == null) return '-';
    if (days === 0) return 'Today!';
    if (days === 1) return `${days} day ago`;
    return `${Math.abs(days)} days ago`;
  }, []);

  const nextWateringText = useCallback((plant: Plant) => {
    const days = differenceInDays(new Date(), calculateNextWatering(plant));
    if (days == null) return '-';
    if (days < 0) return `${Math.abs(days)} days ago`;
    if (days === -1) return `${Math.abs(days)} day ago`;
    if (days === 0) return 'Today!';
    if (days === 1) return `In ${days} day`;
    return `In ${days} days`;
  }, []);

  const waterNow = useCallback(
    (plantId: string) => {
      updateDoc(doc(database, `users/${currentUser?.uid}/plants/${plantId}`), { lastWateringDate: serverTimestamp() });
      addDoc(collection(database, `users/${currentUser?.uid}/plants/${plantId}/waterings`), { wateringDate: serverTimestamp() });
    },
    [currentUser],
  );

  const overdueWatteringClass = (plant: Plant) => {
    const daysToWatering = differenceInDays(new Date(), calculateNextWatering(plant));
    const daysFromLastWatering = differenceInDays(new Date(), plant.lastWateringDate?.toDate());
    if (daysToWatering == 0) return 'border-2 border-red-600';
    if (daysFromLastWatering === 0) return 'border-2 border-lime-500';
    return '';
  };

  if (isLoading) return <Loader />;
  return (
    <div className='flex grow flex-col items-center gap-4'>
      <p className='pt-8 text-9xl select-none'>🪴</p>
      <p className='text-4xl text-slate-300'>Hi {userData?.name} 👋</p>
      <button onClick={() => openModal(<AddNewPlantModal />)} className='btn btn-info btn-wide'>
        Add new plant 🌱
      </button>
      <div className='flex flex-col gap-8 p-8'>
        {plants?.map((plant) => (
          <div className={`stats stats-vertical w-full shadow ${overdueWatteringClass(plant)}`} key={plant.id}>
            <div className='stats text-primary-content'>
              <div className='stat'>
                <div className='stat-title'>Name</div>
                <div className='stat-value'>{plant.name}</div>
              </div>
            </div>
            <div className='stats stat flex items-center justify-center rounded-none p-0 text-primary-content'>
              <div className='stat place-items-center'>
                <div className='stat-title'>Last wattering:</div>
                <div className='flex flex-col items-center gap-2'>
                  <div className='stat-value'>{lastWateringText(plant)}</div>
                  <div className='stat-desc'>{plant.lastWateringDate?.toDate().toLocaleDateString()}</div>
                </div>
              </div>
              <div className='stat place-items-center'>
                <div className='stat-title'>Next wattering:</div>
                <div className='flex flex-col items-center gap-2'>
                  <div className='stat-value'>{nextWateringText(plant)}</div>
                  <div className='stat-desc'>{calculateNextWatering(plant)?.toLocaleDateString()}</div>
                </div>
              </div>
            </div>
            <div className='stat flex'>
              <Link to={`/plant/${plant.id}`} className='btn btn-outline btn-warning'>
                Edit ⚙
              </Link>
              <button className='btn btn-success grow' onClick={() => waterNow(plant.id)}>
                Water now! 💧
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PlantsPage;

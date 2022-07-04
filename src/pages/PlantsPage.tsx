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

  const getDifferenceInDays = useCallback((date1: Date | undefined) => {
    if (!date1) return undefined;

    const date1Midnight = new Date(date1.toDateString());
    const diffTime = date1Midnight.valueOf() - new Date().valueOf();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, []);

  const getDifferenceInDaysText = (date: Date | undefined) => {
    const differenceInDays = getDifferenceInDays(date);
    if (differenceInDays == null) return '-';
    if (differenceInDays === 0) return 'Today!';
    if (differenceInDays < 0) {
      if (differenceInDays === -1) return `${Math.abs(differenceInDays)} day ago`;
      return `${Math.abs(differenceInDays)} days ago`;
    }
    if (differenceInDays > 0) {
      if (differenceInDays === 1) return `In ${differenceInDays} day`;
      return `In ${differenceInDays} days`;
    }
  };

  const waterNow = useCallback(
    (plantId: string) => {
      updateDoc(doc(database, `users/${currentUser?.uid}/plants/${plantId}`), { lastWateringDate: serverTimestamp() });
      addDoc(collection(database, `users/${currentUser?.uid}/plants/${plantId}/waterings`), { wateringDate: serverTimestamp() });
    },
    [currentUser],
  );

  const overdueWatteringClass = (plant: Plant) => {
    const daysToWatering = getDifferenceInDays(calculateNextWatering(plant));
    const daysFromLastWatering = getDifferenceInDays(plant.lastWateringDate?.toDate());
    if (daysToWatering != null && daysToWatering <= 0) return 'border-2 border-red-600';
    if (daysFromLastWatering === 0) return 'border-2 border-lime-500';
    return '';
  };

  if (isLoading) return <Loader />;
  return (
    <div className='flex grow flex-col items-center gap-4'>
      <p className='select-none pt-8 text-9xl'>🪴</p>
      <p className='text-4xl text-slate-300'>Hi {userData?.name} 👋</p>
      <button onClick={() => openModal(<AddNewPlantModal />)} className='btn btn-info btn-wide'>
        Add new plant 🌱
      </button>
      <div className='flex flex-col gap-8 p-8'>
        {plants?.map((plant) => (
          <div className={`flex w-full flex-col overflow-hidden rounded-2xl bg-slate-800 shadow ${overdueWatteringClass(plant)}`} key={plant.id}>
            {plant.imgSrc && (
              <div className='flex border-b border-slate-600 justify-center'>
                <img className='h-96 w-full max-w-lg object-cover' src={plant.imgSrc} />
              </div>
            )}

            <div className='text-primary-content border-b border-slate-600 '>
              <div className='stat'>
                <div className='stat-title'>Name</div>
                <div className='stat-value'>{plant.name}</div>
              </div>
            </div>

            <div className='flex items-center border-b border-slate-600  justify-center rounded-none p-0 text-primary-content'>
              <div className='stat place-items-center border-r border-slate-600'>
                <div className='stat-title'>Last wattering:</div>
                <div className='flex flex-col items-center gap-2'>
                  <div className='stat-value'>{getDifferenceInDaysText(plant.lastWateringDate?.toDate())}</div>
                  <div className='stat-desc'>{plant.lastWateringDate?.toDate().toLocaleDateString()}</div>
                </div>
              </div>
              <div className='stat place-items-center'>
                <div className='stat-title'>Next wattering:</div>
                <div className='flex flex-col items-center gap-2'>
                  <div className='stat-value'>{getDifferenceInDaysText(calculateNextWatering(plant))}</div>
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

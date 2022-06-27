import { useCallback, useEffect, useState } from 'react';
import { addDoc, collection, doc, DocumentData, increment, onSnapshot, QuerySnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';
import { database } from '../firebase';
import { withAuthCheck } from '../components/withAuthCheck';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';
import NavBar from '../components/NavBar';
import Loader from '../components/Loader';
import AddNewPlantModal from '../components/AddNewPlantModal';
import Plant from '../types/Plant';

function HomePage() {
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

      plantsArray.sort((plantA, plantB) => (parseInt(plantA.lastWateringDate?.valueOf()) || 0) - (parseInt(plantB.lastWateringDate?.valueOf()) || 0));
      setPlants(plantsArray);
      setIsPlantsLoading(false);
    });
    return plantsUnsubscribe;
  }, []);

  const incrementWateringInterval = useCallback(
    (plantId: string, value: number) => {
      updateDoc(doc(database, `users/${currentUser?.uid}/plants/${plantId}`), { wateringInterval: increment(value) });
    },
    [currentUser],
  );

  const calculateNextWatering = useCallback((plant: Plant) => {
    if (!plant.lastWateringDate) return;
    const previousWatering = new Date(plant.lastWateringDate.toDate());
    const nextWatering = new Date(previousWatering.valueOf());
    nextWatering.setDate(previousWatering.getDate() + plant.wateringInterval);
    return nextWatering;
  }, []);

  const differenceInDays = useCallback((date1: Date | undefined, date2: Date | undefined) => {
    if (!date1 || !date2) return 0;
    const diffTime = Math.abs(date1.valueOf() - date2.valueOf());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, []);

  const lastWateringText = useCallback((plant: Plant) => {
    const days = differenceInDays(new Date(), plant.lastWateringDate?.toDate());
    if (days === 0) return '-';
    if (days === 1) return `${days} day ago`;
    return `${days} days ago`;
  }, []);

  const nextWateringText = useCallback((plant: Plant) => {
    const days = differenceInDays(new Date(), calculateNextWatering(plant));
    if (days === 0) return '-';
    if (days === 1) return `${days} day ago`;
    return `${days} days ago`;
  }, []);

  const waterNow = useCallback(
    (plantId: string) => {
      updateDoc(doc(database, `users/${currentUser?.uid}/plants/${plantId}`), { lastWateringDate: serverTimestamp() });
      addDoc(collection(database, `users/${currentUser?.uid}/plants/${plantId}/waterings`), { wateringDate: serverTimestamp() });
    },
    [currentUser],
  );

  return (
    <div className='flex min-h-screen flex-col bg-teal-800'>
      <NavBar />
      {isLoading ? (
        <Loader />
      ) : (
        <div className='flex grow flex-col items-center gap-4'>
          <p className='pt-8 text-9xl'>🪴</p>
          <p className='text-4xl text-slate-300'>Hi {userData?.name} 👋</p>
          <button onClick={() => openModal(<AddNewPlantModal />)} className='btn btn-info btn-wide'>
            Add new plant 🌱
          </button>
          <div className='flex flex-col gap-8 p-8'>
            {plants?.map((plant) => (
              <div className='stats stats-vertical w-full shadow' key={plant.id}>
                <div className='stats text-primary-content'>
                  <div className='stat'>
                    <div className='stat-title'>Name</div>
                    <div className='stat-value'>{plant.name}</div>
                  </div>
                  <div className='stat place-items-end'>
                    <div className='stat-title'>Should be watered every</div>
                    <div className='stat-value flex items-end gap-4'>
                      {plant.wateringInterval} {plant.wateringInterval > 1 ? 'days' : 'day'}
                      <div className='btn-group'>
                        <button className='btn btn-sm text-xl font-black' onClick={() => incrementWateringInterval(plant.id, -1)}>
                          -
                        </button>
                        <button className='btn btn-sm text-xl font-black' onClick={() => incrementWateringInterval(plant.id, 1)}>
                          +
                        </button>
                      </div>
                    </div>
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
                <div className='stat'>
                  <button className='btn btn-success gap-2' onClick={() => waterNow(plant.id)}>
                    Water now! 💧
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuthCheck(HomePage, true);

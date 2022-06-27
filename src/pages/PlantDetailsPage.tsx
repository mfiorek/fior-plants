import { collection, deleteDoc, deleteField, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';
import { database } from '../firebase';
import PlantWatering from '../types/PlantWaterings';
import useDebounce from '../hooks/useDebounce';
import Loader from '../components/Loader';
import AddNewWateringModal from '../components/AddNewWateringModal';
import Modal from '../components/Modal';

function PlantDetailsPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { openModal } = useModal();
  const { plantId } = useParams();

  const [isPlantsLoading, setIsPlantsLoading] = useState(true);
  const [isWateringsLoading, setIsWateringsLoading] = useState(true);

  const isLoading = isPlantsLoading || isWateringsLoading;

  const [name, setName] = useState<string | undefined>(undefined);
  const debouncedName = useDebounce(name, 500);
  const [wateringInterval, setWateringInterval] = useState<number | undefined>(undefined);
  const debouncedWateringInterval = useDebounce(wateringInterval, 500);
  const [waterings, setWaterings] = useState<PlantWatering[]>([]);

  // Subscribe to plant data
  useEffect(() => {
    const plantUnsubscribe = onSnapshot(doc(database, `users/${currentUser?.uid}/plants/${plantId}`), (plantData) => {
      if (!plantData.data()) return navigate('/404');
      setName(plantData.data()?.name);
      setWateringInterval(plantData.data()?.wateringInterval);
      setIsPlantsLoading(false);
    });
    return plantUnsubscribe;
  }, []);

  // Subscribe to waterings data
  useEffect(() => {
    const wateringsUnsubscribe = onSnapshot(collection(database, `users/${currentUser?.uid}/plants/${plantId}/waterings`), (wateringsData) => {
      const wateringsArray: PlantWatering[] = [];
      wateringsData.docs.forEach((watering) => {
        wateringsArray.push({ id: watering.id, ...watering.data() } as PlantWatering);
      });
      wateringsArray.sort((wateringA, wateringB) => (wateringB.wateringDate.toDate().valueOf() || 0) - (wateringA.wateringDate.toDate().valueOf() || 0));

      updateDoc(doc(database, `users/${currentUser?.uid}/plants/${plantId}`), { lastWateringDate: wateringsArray[0]?.wateringDate || deleteField() });

      setWaterings(wateringsArray);
      setIsWateringsLoading(false);
    });
    return wateringsUnsubscribe;
  }, []);

  // Save changes in name only after debouced value changes to prevent multiple API calls as user types
  useEffect(() => {
    if (name != null) {
      updateDoc(doc(database, `users/${currentUser?.uid}/plants/${plantId}`), { name: name });
    }
  }, [debouncedName]);

  // Save changes in wateringInterval only after debouced value changes to prevent multiple API calls as user clicks
  useEffect(() => {
    if (wateringInterval != null) {
      updateDoc(doc(database, `users/${currentUser?.uid}/plants/${plantId}`), { wateringInterval: wateringInterval });
    }
  }, [debouncedWateringInterval]);

  const removeWatering = (wateringId: string) => {
    deleteDoc(doc(database, `users/${currentUser?.uid}/plants/${plantId}/waterings/${wateringId}`));
  };

  const incrementWateringInterval = (increment: number) => {
    if (wateringInterval! + increment > 0) {
      setWateringInterval(wateringInterval! + increment);
    }
  };

  const deletePlant = () => {
    const deleteAction = () => {
      deleteDoc(doc(database, `users/${currentUser?.uid}/plants/${plantId}`));
      navigate('/');
    };

    openModal(
      <Modal labelRed='Yes...' labelGreen='No!' handleRed={deleteAction} title='Delete plant 🥀'>
        <p className='py-8 text-4xl font-black'>Do you really want to delete {name}?</p>
      </Modal>,
    );
  };

  if (isLoading) return <Loader />;
  return (
    <div className='flex grow flex-col items-center gap-12 p-4 md:p-12'>
      <div className='w-full lg:w-2/3'>
        <div className='stats stats-vertical flex w-full flex-col shadow'>
          <div className='stat'>
            <div className='stat-title'>Name</div>
            <input
              type='text'
              placeholder='Plantie'
              className='bg-transparent text-4xl font-black focus-visible:outline-none'
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className='stat items-stretch'>
            <div className='stat-title'>Should be watered every</div>
            <div className='stat-value flex flex-wrap items-end justify-between gap-4'>
              <div>
                {wateringInterval} {wateringInterval! > 1 ? 'days' : 'day'}
              </div>
              <div className='btn-group'>
                <button className='btn btn-error btn-square text-xl font-black' onClick={() => incrementWateringInterval(-1)}>
                  <svg className='w-4' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'>
                    <path d='M400 288h-352c-17.69 0-32-14.32-32-32.01s14.31-31.99 32-31.99h352c17.69 0 32 14.3 32 31.99S417.7 288 400 288z' />
                  </svg>
                </button>
                <button className='btn btn-success btn-square text-xl font-black' onClick={() => incrementWateringInterval(1)}>
                  <svg className='w-4' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'>
                    <path d='M432 256c0 17.69-14.33 32.01-32 32.01H256v144c0 17.69-14.33 31.99-32 31.99s-32-14.3-32-31.99v-144H48c-17.67 0-32-14.32-32-32.01s14.33-31.99 32-31.99H192v-144c0-17.69 14.33-32.01 32-32.01s32 14.32 32 32.01v144h144C417.7 224 432 238.3 432 256z' />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='w-full lg:w-2/3'>
        <div className='flex w-full flex-wrap justify-between gap-2 py-4'>
          <h3 className='text-3xl font-bold'>All waterings:</h3>
          <button onClick={() => openModal(<AddNewWateringModal plantId={plantId!} />)} className='btn btn-success btn-wide'>
            Add new watering 💧
          </button>
        </div>
        <div className='stats stats-vertical w-full shadow'>
          {waterings?.length ? (
            waterings?.map((watering) => (
              <div key={watering.id} className='flex items-center justify-between gap-8 border-slate-700 p-4'>
                <div className='stat-value flex flex-wrap gap-x-8'>
                  <div>{watering.wateringDate.toDate().toLocaleDateString()}</div>
                  <div>{watering.wateringDate.toDate().toLocaleTimeString()}</div>
                </div>
                <button className='btn btn-error btn-square text-xl font-black' onClick={() => removeWatering(watering.id)}>
                  <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
                  </svg>
                </button>
              </div>
            ))
          ) : (
            <div className='p-4'>
              <div className='stat-value'>No watterings yet...</div>
            </div>
          )}
        </div>

        <div className='flex justify-end py-12'>
          <button className='btn btn-error' onClick={deletePlant}>
            Delete plant 🥀
          </button>
        </div>
      </div>
    </div>
  );
}

export default PlantDetailsPage;

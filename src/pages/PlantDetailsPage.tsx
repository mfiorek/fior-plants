import { collection, deleteDoc, deleteField, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';
import { database } from '../firebase';
import Plant from '../types/Plant';
import PlantWatering from '../types/PlantWaterings';
import Loader from '../components/Loader';
import AddNewWateringModal from '../components/AddNewWateringModal';
import Modal from '../components/Modal';
import ImageUploader from '../components/ImageUploader';
import PlantEditCard from '../components/PlantEditCard';
import WateringsInfo from '../components/WateringsInfo';

function PlantDetailsPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { openModal } = useModal();
  const { plantId } = useParams();

  const [isPlantsLoading, setIsPlantsLoading] = useState(true);
  const [isWateringsLoading, setIsWateringsLoading] = useState(true);

  const isLoading = isPlantsLoading || isWateringsLoading;

  const [plant, setPlant] = useState<Plant>();
  const [waterings, setWaterings] = useState<PlantWatering[]>([]);

  // Subscribe to plant data
  useEffect(() => {
    const plantUnsubscribe = onSnapshot(doc(database, `users/${currentUser?.uid}/plants/${plantId}`), (plantData) => {
      if (!plantData.data()) return navigate('/404');
      setPlant({ id: plantData.id, ...plantData.data() } as Plant);
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

  const deletePlant = () => {
    const deleteAction = () => {
      deleteDoc(doc(database, `users/${currentUser?.uid}/plants/${plantId}`));
      navigate('/');
    };

    openModal(
      <Modal labelRed='Yes...' labelGreen='No!' handleRed={deleteAction} title='Delete plant 🥀'>
        <p className='py-8 text-4xl font-black'>Do you really want to delete {plant?.name}?</p>
      </Modal>,
    );
  };

  if (isLoading) return <Loader />;
  return (
    <div className='flex justify-center'>
      <div className='flex w-full flex-col gap-8 p-8 lg:w-4/6'>
        <ImageUploader text={plant?.imgSrc ? 'Change image...' : 'Add Image!'} plantId={plantId!} />
        <PlantEditCard plant={plant!} />

        <div className='flex w-full flex-wrap justify-between gap-2 py-4'>
          <h3 className='text-3xl font-bold'>All waterings:</h3>
          <button onClick={() => openModal(<AddNewWateringModal plantId={plantId!} />)} className='btn btn-success btn-wide'>
            Add new watering 💧
          </button>
        </div>
        <WateringsInfo plantId={plant?.id!} waterings={waterings} />

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

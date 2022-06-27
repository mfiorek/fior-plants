import { collection, doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { database } from '../firebase';
import Loader from '../components/Loader';
import Plant from '../types/Plant';
import PlantWatering from '../types/PlantWaterings';

function PlantDetailsPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { plantId } = useParams();

  const [isPlantsLoading, setIsPlantsLoading] = useState(true);
  const [isWateringsLoading, setIsWateringsLoading] = useState(true);
  const [plant, setPlant] = useState<Plant | undefined>(undefined);
  const [waterings, setWaterings] = useState<PlantWatering[]>();

  const isLoading = isPlantsLoading || isWateringsLoading;

  // Subscribe to plant data
  useEffect(() => {
    const plantUnsubscribe = onSnapshot(doc(database, `users/${currentUser?.uid}/plants/${plantId}`), (plantData) => {
      if (!plantData.data()) return navigate('/404');
      setPlant(plantData.data() as Plant);
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
      setWaterings(wateringsArray);
      setIsWateringsLoading(false);
    });
    return wateringsUnsubscribe;
  }, []);

  if (isLoading) return <Loader />;
  return (
    <div className='flex grow flex-col items-center gap-4'>
      <div>PlantPage for {plant?.name}</div>
    </div>
  );
}

export default PlantDetailsPage;

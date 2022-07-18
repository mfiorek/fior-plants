import React, { useCallback } from 'react';
import Plant from '../types/Plant';
import { Link } from 'react-router-dom';
import { calculateNextWatering, getDifferenceInDays, getDifferenceInDaysText } from '../utils/datesUtil';
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { database } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

type PlantCardProps = {
  plant: Plant;
};

const PlantCard: React.FC<PlantCardProps> = ({ plant }) => {
  const { currentUser } = useAuth();

  const overdueWatteringClass = (plant: Plant) => {
    const daysToWatering = getDifferenceInDays(calculateNextWatering(plant));
    const daysFromLastWatering = getDifferenceInDays(plant.lastWateringDate?.toDate());
    if (daysToWatering != null && daysToWatering <= 0) return 'border-4 border-amber-600';
    if (daysFromLastWatering === 0) return 'border-2 border-lime-500';
    return '';
  };

  const waterNow = useCallback(
    (plantId: string) => {
      updateDoc(doc(database, `users/${currentUser?.uid}/plants/${plantId}`), { lastWateringDate: serverTimestamp() });
      addDoc(collection(database, `users/${currentUser?.uid}/plants/${plantId}/waterings`), { wateringDate: serverTimestamp() });
    },
    [currentUser],
  );

  return (
    <div className={`flex w-full flex-col overflow-hidden rounded-2xl bg-slate-800 shadow ${overdueWatteringClass(plant)}`} key={plant.id}>
      {plant.imgSrc && (
        <div className='flex justify-center border-b border-slate-600'>
          <img className='p-6 h-96 w-full max-w-lg object-cover' src={plant.imgSrc} />
        </div>
      )}

      <div className='border-b border-slate-600 text-primary-content '>
        <div className='stat'>
          <div className='stat-title'>Name</div>
          <div className='stat-value'>{plant.name}</div>
        </div>
      </div>

      <div className='flex items-center justify-center rounded-none  border-b border-slate-600 p-0 text-primary-content'>
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
        <Link to={`/plant/${plant.id}`} className='btn btn-outline btn-info'>
          Edit ⚙
        </Link>
        <button className='btn btn-success grow' onClick={() => waterNow(plant.id)}>
          Water now! 💧
        </button>
      </div>
    </div>
  );
};

export default PlantCard;

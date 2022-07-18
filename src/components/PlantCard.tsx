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
    <div className={`flex w-full flex-col overflow-hidden rounded-2xl bg-slate-800 shadow-xl ${overdueWatteringClass(plant)}`} key={plant.id}>
      <Link to={`/plant/${plant.id}`}>
        {plant.imgSrc && (
          <div className='flex justify-center border-b border-slate-600 p-4'>
            <img className='h-96 w-full object-cover' src={plant.imgSrc} />
          </div>
        )}

        <div className='border-b border-slate-600 text-primary-content '>
          <div className='p-4'>
            <div className='opacity-60'>Name</div>
            <div className='text-3xl font-extrabold'>{plant.name}</div>
          </div>
        </div>

        <div className='flex items-center justify-center rounded-none border-b border-slate-600 p-0 text-primary-content'>
          <div className='flex grow flex-col place-items-center border-r border-slate-600 p-4'>
            <div className='opacity-60'>Last wattering:</div>
            <div className='flex flex-col items-center gap-2'>
              <div className='text-3xl font-extrabold'>{getDifferenceInDaysText(plant.lastWateringDate?.toDate())}</div>
              <div className='text-xs opacity-60'>{plant.lastWateringDate?.toDate().toLocaleDateString()}</div>
            </div>
          </div>
          <div className='flex grow flex-col place-items-center p-4'>
            <div className='opacity-60'>Next wattering:</div>
            <div className='flex flex-col items-center gap-2'>
              <div className='text-3xl font-extrabold'>{getDifferenceInDaysText(calculateNextWatering(plant))}</div>
              <div className='text-xs opacity-60'>{calculateNextWatering(plant)?.toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </Link>

      <div className='flex gap-4 p-4'>
        <button className='btn btn-success grow' onClick={() => waterNow(plant.id)}>
          Water now! 💧
        </button>
      </div>
    </div>
  );
};

export default PlantCard;

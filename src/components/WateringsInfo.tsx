import { deleteDoc, doc } from 'firebase/firestore';
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { database } from '../firebase';
import PlantWatering from '../types/PlantWaterings';

type WateringsInfoProps = {
  plantId: string;
  waterings: PlantWatering[];
};

const WateringsInfo: React.FC<WateringsInfoProps> = ({ plantId, waterings }) => {
  const { currentUser } = useAuth();

  const removeWatering = (wateringId: string) => {
    deleteDoc(doc(database, `users/${currentUser?.uid}/plants/${plantId}/waterings/${wateringId}`));
  };

  return (
    <div className='flex w-full flex-col overflow-hidden rounded-2xl bg-slate-800 shadow-xl'>
      {waterings?.length ? (
        waterings?.map((watering) => (
          <div key={watering.id} className='flex items-center justify-between gap-8 border-b border-slate-600 p-4 last:border-b-0'>
            <div className='flex flex-wrap gap-x-8 text-3xl font-extrabold'>
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
          <div className='text-3xl font-extrabold'>No watterings yet...</div>
        </div>
      )}
    </div>
  );
};

export default WateringsInfo;

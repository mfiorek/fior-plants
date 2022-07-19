import React, { useEffect, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { database } from '../firebase';
import Plant from '../types/Plant';
import useDebounce from '../hooks/useDebounce';

type PlantEditCardProps = {
  plant: Plant;
};

const PlantEditCard: React.FC<PlantEditCardProps> = ({ plant }) => {
  const { currentUser } = useAuth();

  const [name, setName] = useState<string>(plant.name);
  const debouncedName = useDebounce(name, 500);
  const [wateringInterval, setWateringInterval] = useState<number>(plant.wateringInterval);
  const debouncedWateringInterval = useDebounce(wateringInterval, 500);

  // Save changes in name only after debouced value changes to prevent multiple API calls as user types
  useEffect(() => {
    if (name != null) {
      updateDoc(doc(database, `users/${currentUser?.uid}/plants/${plant.id}`), { name: name });
    }
  }, [debouncedName]);

  // Save changes in wateringInterval only after debouced value changes to prevent multiple API calls as user clicks
  useEffect(() => {
    if (wateringInterval != null) {
      updateDoc(doc(database, `users/${currentUser?.uid}/plants/${plant.id}`), { wateringInterval: wateringInterval });
    }
  }, [debouncedWateringInterval]);

  const incrementWateringInterval = (increment: number) => {
    if (wateringInterval! + increment > 0) {
      setWateringInterval(wateringInterval! + increment);
    }
  };

  return (
    <div className='flex w-full flex-col overflow-hidden rounded-2xl bg-slate-800 shadow-xl'>
      {plant.imgSrc && (
        <div className='flex justify-center border-b border-slate-600 p-4'>
          <img className='h-96 w-full object-cover' src={plant.imgSrc} />
        </div>
      )}

      <div className='border-b border-slate-600 p-4 '>
        <div className='opacity-60'>Name</div>
        <input
          type='text'
          placeholder='Plantie'
          className='bg-transparent text-3xl font-extrabold focus-visible:outline-none'
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>

      <div className='flex flex-wrap items-end justify-between gap-4 p-4'>
        <div className='flex flex-col'>
          <p className='opacity-60'>Should be watered every</p>
          <p className='text-3xl font-extrabold'>
            {wateringInterval} {wateringInterval! > 1 ? 'days' : 'day'}
          </p>
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
  );
};

export default PlantEditCard;

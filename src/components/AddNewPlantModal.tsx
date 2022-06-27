import { addDoc, collection } from 'firebase/firestore';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { database } from '../firebase';
import Modal from './Modal';

const AddNewPlantModal = () => {
  const { currentUser } = useAuth();
  const [plantName, setPlantName] = useState('');

  const addNewPlant = () => {
    addDoc(collection(database, `users/${currentUser?.uid}/plants/`), { name: plantName, wateringInterval: 1 });
  };

  return (
    <Modal title='Add new plant 🌱' labelGreen='Add' handleGreen={addNewPlant} disableGreen={!plantName} labelRed='Close'>
      <div className='form-control mt-8 mb-12'>
        <label className='label'>
          <span className='label-text'>Plant name</span>
        </label>
        <input type='text' placeholder='Plantie' className='input input-bordered' onChange={(event) => setPlantName(event.target.value)} />
      </div>
    </Modal>
  );
};

export default AddNewPlantModal;

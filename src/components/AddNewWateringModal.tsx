import { addDoc, collection } from 'firebase/firestore';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { database } from '../firebase';
import Modal from './Modal';

type AddNewWateringModalProps = {
  plantId: string;
};

const AddNewWateringModal: React.FC<AddNewWateringModalProps> = ({ plantId }) => {
  const { currentUser } = useAuth();
  const [date, setDate] = useState<any>();

  const addNewWatering = () => {
    if (!!date) {
      addDoc(collection(database, `users/${currentUser?.uid}/plants/${plantId}/waterings`), { wateringDate: new Date(date) });
    }
  };

  return (
    <Modal title='Add new watering 💧' labelGreen='Add' handleGreen={addNewWatering} disableGreen={!date} labelRed='Close'>
      <div className='form-control mt-8 mb-12'>
        <label className='label w-12'>
          <span className='label-text'>Date</span>
        </label>
        <input type='datetime-local' className='bg-transparent text-4xl font-black focus-visible:outline-none' onChange={(event) => setDate(event.target.value)} />
      </div>
    </Modal>
  );
};

export default AddNewWateringModal;

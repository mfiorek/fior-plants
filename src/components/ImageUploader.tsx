import React, { useState } from 'react';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { database, storage } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

type ImageUploaderProps = {
  text: string;
  plantId: string;
};

const ImageUploader: React.FC<ImageUploaderProps> = ({ text, plantId }) => {
  const { currentUser } = useAuth();
  const [progress, setProgress] = useState<number | null>(null);
  const storageRef = ref(storage, `${currentUser?.uid}/${plantId}`);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target?.files?.length) return;
    const uploadTask = uploadBytesResumable(storageRef, e.target.files[0]);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const uploadingProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(uploadingProgress);
      },
      (error) => {
        console.error(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref)
          .then((downloadURL) => {
            updateDoc(doc(database, `users/${currentUser?.uid}/plants/${plantId}`), { imgSrc: downloadURL });
          })
          .finally(() => {
            setProgress(null);
          });
      },
    );
  };

  if (progress != null) {
    return (
      <div className='flex flex-col items-center gap-2'>
        <p>
          Uploading image <span className='font-bold'>{progress.toFixed()}%</span>
        </p>
        <progress className='progress progress-info w-96' value={progress} max='100'></progress>
      </div>
    );
  }

  return (
    <>
      <input id='file' type='file' capture='environment' accept='image/*' className='hidden' onChange={handleFileInput} />
      <label htmlFor='file'>
        <a className='btn btn-success cursor-pointer'>{text}</a>
      </label>
    </>
  );
};

export default ImageUploader;

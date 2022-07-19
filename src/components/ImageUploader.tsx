import React, { useState } from 'react';
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { database, storage } from '../firebase';
import { deleteField, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';
import Plant from '../types/Plant';
import Modal from './Modal';

type ImageUploaderProps = {
  plant: Plant;
};

const ImageUploader: React.FC<ImageUploaderProps> = ({ plant }) => {
  const { currentUser } = useAuth();
  const { openModal } = useModal();
  const [progress, setProgress] = useState<number | null>(null);
  const storageRef = ref(storage, `${currentUser?.uid}/${plant.id}`);

  const isCaptureSupported = document.createElement('input').capture != undefined;

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
            updateDoc(doc(database, `users/${currentUser?.uid}/plants/${plant.id}`), { imgSrc: downloadURL });
          })
          .finally(() => {
            setProgress(null);
          });
      },
    );
  };

  const deleteImage = () => {
    const deleteAction = () => {
      deleteObject(storageRef).then(() => {
        updateDoc(doc(database, `users/${currentUser?.uid}/plants/${plant.id}`), { imgSrc: deleteField() });
      });
    };

    openModal(
      <Modal labelRed='Yes...' labelGreen='No!' handleRed={deleteAction} title='Delete this image?'>
        <p className='py-8 text-4xl font-black'>Do you really want to delete {plant?.name} image?</p>
      </Modal>,
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
    <div className='flex flex-wrap justify-between'>
      <div className='btn-group'>
        {isCaptureSupported && (
          <>
            <input id='capture' type='file' capture='environment' accept='image/*' className='hidden' onChange={handleFileInput} />
            <label htmlFor='capture' className='btn btn-accent cursor-pointer'>
              <a>{plant.imgSrc ? '📷 Capture new image' : '📷 Capture image!'}</a>
            </label>
          </>
        )}

        <input id='file' type='file' className='hidden' onChange={handleFileInput} />
        <label htmlFor='file' className='btn btn-accent cursor-pointer'>
          <a>{plant.imgSrc ? '🖼 Select new image' : '🖼 Select image!'}</a>
        </label>
      </div>

      {plant.imgSrc && (
        <button className='btn btn-error' onClick={deleteImage}>
          Delete image ♻
        </button>
      )}
    </div>
  );
};

export default ImageUploader;

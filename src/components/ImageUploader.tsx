import React from 'react';
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
  const storageRef = ref(storage, `${currentUser?.uid}/${plantId}`);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target?.files?.length) return;
    const uploadTask = uploadBytesResumable(storageRef, e.target.files[0]);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // TODO progress bar?
        // const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        // console.log('Upload is ' + progress + '% done');
      },
      (error) => {
        console.error(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          updateDoc(doc(database, `users/${currentUser?.uid}/plants/${plantId}`), { imgSrc: downloadURL });
        });
      },
    );
  };

  return (
    <>
      <input type='file' id='file' className='hidden' onChange={handleFileInput} />
      <label htmlFor='file'>
        <a className='btn btn-success cursor-pointer'>{text}</a>
      </label>
    </>
  );
};

export default ImageUploader;

import React from 'react';
import { useModal } from '../contexts/ModalContext';

type Props = {
  children?: React.ReactNode;
  title?: string;
  handleGreen?: any;
  labelGreen?: string;
  disableGreen?: boolean;
  handleRed?: any;
  labelRed?: string;
  disableRed?: boolean;
};

const Modal: React.FC<Props> = (props) => {
  const { title, handleGreen, handleRed, labelGreen, labelRed, disableGreen, disableRed, children } = props;
  let { closeModal } = useModal();

  const onGreen = () => {
    handleGreen();
    closeModal();
  };

  const onRed = () => {
    handleRed();
    closeModal();
  };

  return (
    <div className='fixed top-0 left-0 z-50 flex h-screen w-full items-center justify-center bg-black bg-opacity-80'>
      {/* <div style={{ minWidth: '50%' }} className='flex flex-col rounded-2xl bg-slate-700 p-5  shadow-lg'> */}
      <div className='modal-box'>
        {title && <p className='mb-3 text-2xl font-bold'>{title}</p>}
        <div className='my-4'>{children}</div>
        {(labelGreen || labelRed) && (
          <div className='mt-2 flex flex-grow gap-4'>
            {labelRed && (
              <button onClick={onRed} disabled={disableRed} className='btn btn-error grow'>
                {labelRed}
              </button>
            )}
            {labelGreen && (
              <button onClick={onGreen} disabled={disableGreen} className='btn btn-success grow'>
                {labelGreen}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

Modal.defaultProps = {
  title: undefined,
  handleGreen: () => {},
  labelGreen: undefined,
  disableGreen: false,
  handleRed: () => {},
  labelRed: undefined,
  disableRed: false,
};

export default Modal;

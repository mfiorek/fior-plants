import React, { useContext } from 'react';
import ReactDOM from 'react-dom';

interface IModalContext {
  isOpen: boolean;
  openModal: (content: React.ReactNode) => void;
  closeModal: () => void;
  modalContent: React.ReactNode;
}

const ModalContext = React.createContext<IModalContext>({} as IModalContext);

export function useModal() {
  return useContext(ModalContext);
}

const ModalPortal = () => {
  const modalRoot = document.getElementById('modal-root') as HTMLElement;
  const { isOpen, modalContent } = useModal();

  if (!isOpen) {
    return null;
  }
  return ReactDOM.createPortal(<>{modalContent}</>, modalRoot);
};

export const ModalProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [modalContent, setModalContent] = React.useState<React.ReactNode>(null);

  const openModal = (content: React.ReactNode) => {
    setIsOpen(true);
    if (content) {
      setModalContent(content);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setModalContent(null);
  };

  return (
    <ModalContext.Provider value={{ isOpen, openModal, closeModal, modalContent }}>
      <ModalPortal />
      {children}
    </ModalContext.Provider>
  );
};
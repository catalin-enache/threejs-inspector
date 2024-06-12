import { useEffect, useRef, useCallback } from 'react';
import './Modal.css';

interface ModalProps {
  children: any;
  isOpen: boolean;
  onClose: () => void;
  width?: string;
  title?: string;
}

// Using imperative DOM since we cannot use React predefined elements inside R3F canvas.
export const Modal = (props: ModalProps) => {
  const { children, isOpen, onClose, title = '', width = '400px' } = props;
  const modalHostRef = useRef<HTMLDivElement | null>(null);
  const buttonCloseRef = useRef<HTMLButtonElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const handleCloseRef = useRef<any>(null);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const modalContainer = document.createElement('div');
    modalContainer.classList.add('inspectorModal');
    modalContainer.style.width = width;
    document.body.appendChild(modalContainer);
    modalHostRef.current = modalContainer;

    const modalTitle = document.createElement('div');
    modalTitle.classList.add('inspectorModal__title');
    modalTitle.innerText = title;
    modalContainer.appendChild(modalTitle);

    const content = document.createElement('div');
    content.classList.add('inspectorModal__content');
    contentRef.current = content;
    content.appendChild(children);
    modalContainer.appendChild(content);

    const closeButton = document.createElement('button');
    closeButton.classList.add('inspectorModal__closeBtn');
    closeButton.innerText = 'Close';
    buttonCloseRef.current = closeButton;
    buttonCloseRef.current.addEventListener('click', handleClose);
    modalContainer.appendChild(closeButton);

    return () => {
      modalHostRef.current = null;
      buttonCloseRef.current!.removeEventListener('click', handleCloseRef.current);
      buttonCloseRef.current = null;
      document.body.removeChild(modalContainer);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!buttonCloseRef.current) return;
    buttonCloseRef.current.removeEventListener('click', handleCloseRef.current);
    buttonCloseRef.current.addEventListener('click', handleClose);
    handleCloseRef.current = handleClose;
  }, [handleClose]);

  return null;
};

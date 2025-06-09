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

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const handleClose = useCallback(() => {
    onCloseRef.current?.();
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [handleClose, isOpen]);

  useEffect(() => {
    const controlPanelContent = document.getElementById('controlPanelContent');
    if (!isOpen || !controlPanelContent) {
      return;
    }
    const modalContainer = document.createElement('div');
    modalContainer.classList.add('inspectorModal');
    modalContainer.style.width = width;
    controlPanelContent.appendChild(modalContainer);

    const modalTitle = document.createElement('div');
    modalTitle.classList.add('inspectorModal__title');
    modalTitle.innerText = title;
    modalContainer.appendChild(modalTitle);

    const content = document.createElement('div');
    content.classList.add('inspectorModal__content');
    content.appendChild(children);
    modalContainer.appendChild(content);

    const closeButton = document.createElement('button');
    closeButton.classList.add('inspectorModal__closeBtn');
    closeButton.innerText = 'Close';
    closeButton.addEventListener('click', handleClose);
    modalContainer.appendChild(closeButton);

    return () => {
      closeButton.removeEventListener('click', handleClose);
      controlPanelContent.removeChild(modalContainer);
    };
  }, [children, handleClose, isOpen, title, width]);

  return null;
};

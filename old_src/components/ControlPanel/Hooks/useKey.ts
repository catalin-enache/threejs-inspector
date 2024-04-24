import { useEffect } from 'react';

interface useKeyProps {
  keyCode: string;
  keyDownCallback?: () => void;
  keyUpCallback?: () => void;
}
export const useKey = ({
  keyCode,
  keyDownCallback,
  keyUpCallback
}: useKeyProps) => {
  useEffect(() => {
    const handleKeyDown = (evt: KeyboardEvent) => {
      if (evt.code === keyCode) {
        keyDownCallback && keyDownCallback();
      }
    };
    const handleKeyUp = (evt: KeyboardEvent) => {
      if (evt.code === keyCode) {
        keyUpCallback && keyUpCallback();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [keyCode, keyDownCallback, keyUpCallback]);
};

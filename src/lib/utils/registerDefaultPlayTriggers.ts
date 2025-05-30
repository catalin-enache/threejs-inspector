import { useAppStore } from 'src/store';

const keysDownHandler = (event: KeyboardEvent) => {
  if (event.code === 'Space') {
    event.stopPropagation();
    event.preventDefault();
    if (useAppStore.getState().getPlayingState() === 'playing') {
      useAppStore.getState().setPlayingState('paused');
    } else {
      useAppStore.getState().setPlayingState('playing');
    }
  } else if (event.code === 'Backspace') {
    useAppStore.getState().setPlayingState('stopped');
  }
};

const keysUpHandler = (event: KeyboardEvent) => {
  if (event.code === 'Space') {
    event.stopPropagation();
    event.preventDefault(); // to not interfere with form focused elements and cPanel folder collapsing
  }
};

export const registerDefaultPlayTriggers = () => {
  window.addEventListener('keydown', keysDownHandler);
  window.addEventListener('keyup', keysUpHandler);
  return () => {
    window.removeEventListener('keydown', keysDownHandler);
    window.removeEventListener('keyup', keysUpHandler);
  };
};

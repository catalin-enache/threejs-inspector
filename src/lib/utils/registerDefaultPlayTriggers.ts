import { useAppStore } from 'src/store';

const keysHandler = (event: KeyboardEvent) => {
  if (event.code === 'Space') {
    if (useAppStore.getState().getPlayingState() === 'playing') {
      useAppStore.getState().setPlayingState('paused');
    } else {
      useAppStore.getState().setPlayingState('playing');
    }
  } else if (event.code === 'Backspace') {
    useAppStore.getState().setPlayingState('stopped');
  }
};

export const registerDefaultPlayTriggers = () => {
  window.addEventListener('keydown', keysHandler);
  return () => {
    window.removeEventListener('keydown', keysHandler);
  };
};

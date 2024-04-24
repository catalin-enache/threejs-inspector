import { Pane } from 'tweakpane';
export const makeContinuousUpdate = (pane: Pane) => {
  let id: number;
  const update = () => {
    pane.refresh();
    id = window.requestAnimationFrame(update);
  };
  return {
    start: () => {
      id && window.cancelAnimationFrame(id);
      id = window.requestAnimationFrame(update);
    },
    stop: () => {
      window.cancelAnimationFrame(id);
    }
  };
};

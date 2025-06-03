// @ts-ignore
import Stats from 'three/addons/libs/stats.module.js';

const stats = new Stats();
let animFrame: ReturnType<typeof requestAnimationFrame> | null = 0;

const updateStats = () => {
  if (stats.dom.parentElement) {
    stats.update();
    animFrame = requestAnimationFrame(updateStats);
  } else {
    animFrame !== null && cancelAnimationFrame(animFrame);
  }
};

export const injectStats = () => {
  if (!stats.dom.parentElement) {
    document.body.appendChild(stats.dom);
    updateStats();
  }
  return () => {
    if (stats.dom.parentElement) {
      document.body.removeChild(stats.dom);
    }
  };
};

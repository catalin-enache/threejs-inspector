import * as THREE from 'three';

const clock = new THREE.Clock();

export function animate(callback: (delta: number) => void) {
  let id: number;
  const update = () => {
    id = window.requestAnimationFrame(update);
    callback(clock.getDelta());
  };
  return {
    start: () => {
      id && window.cancelAnimationFrame(id);
      clock.getDelta(); // like a reset so that next delta won't bee too big
      id = window.requestAnimationFrame(update);
    },
    stop: () => {
      window.cancelAnimationFrame(id);
    }
  };
}

import * as THREE from 'three';

const clock = new THREE.Clock();

export const callbacks: Map<any, (delta: number) => void> = new Map();
// reusing delta for multiple animations
let delta = 0;
const updateDelta = () => {
  delta = clock.getDelta();
  callbacks.forEach((cb) => cb(delta));
  window.requestAnimationFrame(updateDelta);
};
window.requestAnimationFrame(updateDelta);

export function animate(callback: (delta: number) => void, id: any) {
  console.log('animate', callbacks.size);
  return {
    start: () => {
      callbacks.set(id, callback);
    },
    stop: () => {
      callbacks.delete(id);
    },
    clear: () => {
      callbacks.clear();
    }
  };
}

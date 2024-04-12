import * as THREE from 'three';
import { TransformControls, OrbitControls } from 'three-stdlib';

export const isObject = (value: any) => {
  return value && value.constructor === Object;
};

export const isArray = (value: any) => {
  return Array.isArray(value);
};

export const isEqual = (prev: any, next: any) => {
  // for primitives make a simple comparison
  if (!isObject(prev) && !isArray(prev)) return prev === next;
  const keys = Object.keys(prev);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (prev[key] !== next[key]) {
      return false;
    }
  }
  return true;
};

export const shallowClone = (value: any) => {
  if (isObject(value)) {
    return { ...value };
  } else if (isArray(value)) {
    return [...value];
  }
  return value;
};

// not used
export const setFullScreen = (isFullScreen: boolean) => {
  const fullScreenOn = document.documentElement;
  const fullscreenElement =
    // @ts-ignore
    document.fullscreenElement || document.webkitFullscreenElement;

  const requestFullscreen =
    // prettier-ignore
    // @ts-ignore
    (fullScreenOn.requestFullscreen || fullScreenOn.webkitRequestFullscreen).bind(fullScreenOn);
  const exitFullscreen =
    // prettier-ignore
    // @ts-ignore
    (document.exitFullscreen || document.webkitExitFullscreen).bind(document);

  if (!fullscreenElement && isFullScreen) {
    requestFullscreen();
  } else {
    fullscreenElement && exitFullscreen();
  }
};

export const degToRad = (deg: number) => (deg / 180) * Math.PI;
export const radToDegFormatter = (rad: number) =>
  ((rad / Math.PI) * 180).toFixed(2);

export const focusCamera = ({
  transformControls,
  orbitControls,
  camera
}: {
  transformControls?: TransformControls | null;
  orbitControls?: OrbitControls | null;
  camera: THREE.Camera;
}) => {
  const focusOn = new THREE.Vector3(); // center of the stage by default
  transformControls?.['object']?.getWorldPosition(focusOn);
  if (orbitControls) {
    orbitControls.target.copy(focusOn);
    orbitControls.update();
  } else {
    camera.lookAt(focusOn);
  }
};

// not used // maybe implement this later
// some transforms are irrelevant for some objects
export const transformExcludeMap = {
  scale: [THREE.SpotLight, THREE.DirectionalLight],
  rotation: [THREE.SpotLight, THREE.DirectionalLight],
  rotate: [THREE.SpotLight, THREE.DirectionalLight]
};

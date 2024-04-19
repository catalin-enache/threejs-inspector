import * as THREE from 'three';
import { TransformControls, OrbitControls } from 'three-stdlib';
import { isTextureImage, isTexture } from 'lib/types';

export const isObject = (value: any) => {
  return (
    // value !== null && typeof value === 'object' && // compatible with Tweakpane if needed
    value &&
    value.constructor === Object &&
    !isArray(value) &&
    !isTextureImage(value) &&
    !isTexture(value)
  );
};

export const isArray = (value: any) => {
  return Array.isArray(value);
};
const scalingFactor = 100000;
// assuming left and right are the same type
const isEqualPrimitive = (left: any, right: any) => {
  if (typeof left === 'number') {
    const _left = Math.round(left * scalingFactor) / scalingFactor;
    const _right = Math.round(right * scalingFactor) / scalingFactor;
    return _left === _right;
  }
  return left === right;
};

// assuming left and right are the same type and one level deep object
export const isEqual = (left: any, right: any) => {
  // for primitives make a simple comparison
  if (!isObject(left) && !isArray(left)) return isEqualPrimitive(left, right);
  const keys = Object.keys(left);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (!isEqualPrimitive(left[key], right[key])) {
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

// TODO: not used // maybe implement this later
// some transforms are irrelevant for some objects (like scale for camera or light)
export const transformExcludeMap = {
  scale: [THREE.SpotLight, THREE.DirectionalLight],
  rotation: [THREE.SpotLight, THREE.DirectionalLight],
  rotate: [THREE.SpotLight, THREE.DirectionalLight]
};

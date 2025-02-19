import * as THREE from 'three';

export const objectHasSkeleton = (object: THREE.Object3D) => {
  let hasSkeleton = false;
  object.traverse((descendant) => {
    if (descendant instanceof THREE.SkinnedMesh) {
      hasSkeleton = true;
    }
  });
  return hasSkeleton;
};

export const isAutoInspectableObject = (object: THREE.Object3D) => {
  return (
    object instanceof THREE.Light ||
    object instanceof THREE.Camera ||
    object instanceof THREE.CubeCamera ||
    object instanceof THREE.PositionalAudio
  );
};

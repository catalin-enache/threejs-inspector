import * as THREE from 'three';

export const focusCamera = ({
  transformControls,
  orbitControls
}: {
  transformControls: any;
  orbitControls: any;
}) => {
  if (!transformControls.object) {
    orbitControls.target.set(0, 0, 0);
  } else {
    const focusOn = new THREE.Vector3();
    transformControls.object.getWorldPosition(focusOn);
    const { x, y, z } = focusOn;
    orbitControls.target.set(x, y, z);
  }
};

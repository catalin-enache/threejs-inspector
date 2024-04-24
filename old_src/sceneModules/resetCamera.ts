import THREE from 'three';

export const resetCamera = ({
  code,
  camera,
  orbitControls
}: {
  code: string;
  camera: THREE.Camera;
  orbitControls: any;
}) => {
  if (code === 'Numpad1') {
    // front
    camera.position.set(0, 0, 12);
  } else if (code === 'Numpad7') {
    // top
    camera.position.set(0, 12, 0);
  } else if (code === 'Numpad3') {
    // right
    camera.position.set(12, 0, 0);
  } else if (code === 'Numpad9') {
    // inverse
    camera.position.negate();
  }
  camera.lookAt(0, 0, 0);
  orbitControls.target.set(0, 0, 0);
};

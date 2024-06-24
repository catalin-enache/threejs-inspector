import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as THREE from 'three';
import { SceneSize } from 'old_src/config';

export const focusCamera = ({
  transformControls,
  orbitControls,
  camera
}: {
  transformControls?: TransformControls | null;
  orbitControls?: OrbitControls | null;
  camera?: THREE.Camera;
}) => {
  if (!camera) return;
  const focusOn = new THREE.Vector3(); // center of the stage by default
  transformControls?.['object']?.getWorldPosition(focusOn);
  if (orbitControls) {
    orbitControls.target.copy(focusOn);
    orbitControls.update();
  } else {
    camera.lookAt(focusOn);
  }
};

export const resetCamera = ({
  code,
  camera,
  orbitControls
}: {
  code: string;
  camera?: THREE.Camera;
  orbitControls?: OrbitControls | null;
}) => {
  if (!camera) return;
  const distance = camera.position.length();
  if (code === 'Numpad1') {
    // front
    camera.position.set(0, 0, distance);
  } else if (code === 'Numpad7') {
    // top
    camera.position.set(0, distance, 0);
  } else if (code === 'Numpad3') {
    // right
    camera.position.set(distance, 0, 0);
  } else if (code === 'Numpad9') {
    // inverse
    camera.position.negate();
  }
  camera.lookAt(0, 0, 0);
  orbitControls?.target.set(0, 0, 0);
};

const _vector = new THREE.Vector3();
export const project3DCoordinateOnCamera = ({
  camera,
  sceneSize,
  object
}: {
  camera: THREE.Camera;
  sceneSize: SceneSize;
  object: THREE.Object3D;
}) => {
  const widthHalf = 0.5 * sceneSize.width;
  const heightHalf = 0.5 * sceneSize.height;
  object.updateMatrixWorld();
  camera.updateMatrixWorld();
  // Get the position of the center of the object in world space
  _vector.setFromMatrixPosition(object.matrixWorld);
  // Project the 3D position vector onto the 2D screen using the camera
  _vector.project(camera);
  const x = widthHalf + _vector.x * widthHalf; // good
  const y = heightHalf - _vector.y * heightHalf; // good
  // const x = (_vector.x * 0.5 + 0.5) * sceneSize.width; // good
  // const y = (_vector.y * -0.5 + 0.5) * sceneSize.height; // good

  const roundedX = x.toFixed(2);
  const roundedY = y.toFixed(2);

  return { x: +roundedX, y: +roundedY };
};

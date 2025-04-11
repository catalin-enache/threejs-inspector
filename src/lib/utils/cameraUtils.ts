import * as THREE from 'three';
import { SceneSize } from 'old_src/config';

export const focusCamera = () => {
  // handled by FlyControls
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', code: 'KeyF' }));
};

const _vector = new THREE.Vector3();
export const project3DCoordinateOnCamera = ({
  camera,
  sceneSize,
  object
}: {
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
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

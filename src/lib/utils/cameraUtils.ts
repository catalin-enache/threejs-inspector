import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as THREE from 'three';
import { SceneSize } from 'old_src/config';
import patchThree from 'lib/patchThree';

export const focusCamera = ({
  transformControls = patchThree.getTransformControls(),
  cameraControls = patchThree.getCameraControls(),
  camera = patchThree.getCurrentCamera()
}: {
  transformControls?: TransformControls | null;
  cameraControls?: OrbitControls | null;
  camera?: THREE.PerspectiveCamera | THREE.OrthographicCamera | null;
} = {}) => {
  if (!camera) return;
  const focusOn = new THREE.Vector3(); // center of the stage by default
  transformControls?.['object']?.getWorldPosition(focusOn);
  if (cameraControls) {
    if (cameraControls.target) {
      cameraControls.target.set(focusOn.x, focusOn.y, focusOn.z);
      // @ts-ignore
    } else if (cameraControls.setTarget) {
      // compatible with https://github.com/yomotsu/camera-controls
      // @ts-ignore
      cameraControls.setTarget(focusOn.x, focusOn.y, focusOn.z);
    }
    cameraControls.update();
  } else {
    camera.lookAt(focusOn);
  }
};

export const resetCamera = ({
  code,
  camera = patchThree.getCurrentCamera(),
  cameraControls = patchThree.getCameraControls()
}: {
  code: string;
  camera?: THREE.PerspectiveCamera | THREE.OrthographicCamera | null;
  cameraControls?: OrbitControls | null;
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

  if (!cameraControls) return;

  if (cameraControls.target) {
    cameraControls.target.set(0, 0, 0);
    // @ts-ignore
  } else if (cameraControls.setTarget) {
    // compatible with https://github.com/yomotsu/camera-controls
    // @ts-ignore
    cameraControls.setTarget(0, 0, 0);
    // @ts-ignore
    cameraControls.setPosition(camera.position.x, camera.position.y, camera.position.z);
    // alternate sets position and target
    // orbitControls.setLookAt(camera.position.x, camera.position.y, camera.position.z, 0, 0, 0);
  }

  cameraControls.update();
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

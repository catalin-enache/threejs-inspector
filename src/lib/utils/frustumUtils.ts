import * as THREE from 'three';

const frustum = new THREE.Frustum();
const cameraViewProjectionMatrix = new THREE.Matrix4();
// not used
export function updateFrustum(camera: THREE.PerspectiveCamera | THREE.OrthographicCamera) {
  camera.updateMatrix();
  camera.updateMatrixWorld();
  camera.updateProjectionMatrix();
  camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
  cameraViewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  frustum.setFromProjectionMatrix(cameraViewProjectionMatrix);
}

const box = new THREE.Box3();
const objWorldPosition = new THREE.Vector3();
// not used
export function isObjectVisibleInFrustum(obj: THREE.Object3D, withBoundingBox = false) {
  if (withBoundingBox) {
    box.setFromObject(obj);
    return frustum.intersectsBox(box);
  } else {
    obj.getWorldPosition(objWorldPosition);
    return frustum.containsPoint(objWorldPosition);
  }
}

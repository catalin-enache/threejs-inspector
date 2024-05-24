import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';

// @ts-ignore
function parallelTraverse(
  a: THREE.Object3D,
  b: THREE.Object3D,
  callback: (a: THREE.Object3D, b: THREE.Object3D) => void
) {
  callback(a, b);
  for (let i = 0; i < a.children.length; i++) {
    parallelTraverse(a.children[i], b.children[i], callback);
  }
}

export const cloneObject3D = (root: THREE.Object3D) => {
  const newRoot = SkeletonUtils.clone(root);
  newRoot.__inspectorData.isInspectable = root.__inspectorData.isInspectable;
  if (root.__inspectorData.hitRedirect === root) {
    newRoot.__inspectorData.hitRedirect = newRoot;
  } else if (root.__inspectorData.hitRedirect) {
    newRoot.__inspectorData.hitRedirect = root.__inspectorData.hitRedirect;
  }
  return newRoot;
};

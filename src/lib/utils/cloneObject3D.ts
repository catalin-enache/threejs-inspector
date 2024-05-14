import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';

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
  parallelTraverse(root, newRoot, (oldObject, newObject) => {
    newObject.__inspectorData.isInspectable = oldObject.__inspectorData?.isInspectable;
    newObject.__inspectorData.hitRedirect =
      oldObject.__inspectorData?.hitRedirect === root ? newRoot : oldObject.__inspectorData?.hitRedirect;
  });
  return newRoot;
};

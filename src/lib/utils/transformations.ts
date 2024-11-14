import * as THREE from 'three';

export const rotateAroundPoint = (
  object: THREE.Object3D,
  point: THREE.Vector3,
  axis: THREE.Vector3,
  angle: number,
  orientItself: boolean = true
) => {
  // Step 1: Translate the object to the point of rotation
  object.position.sub(point);

  // Step 2: Apply rotation around the axis
  // Create a quaternion to represent the rotation
  const quaternion = new THREE.Quaternion();
  quaternion.setFromAxisAngle(axis.normalize(), angle);

  // Apply the rotation to the object's position
  object.position.applyQuaternion(quaternion);

  // Step 3: Translate the object back to its original position
  object.position.add(point);

  // Finally, rotate the object itself to maintain the rotation in its local space
  if (orientItself) {
    object.quaternion.multiplyQuaternions(quaternion, object.quaternion);
  }
};

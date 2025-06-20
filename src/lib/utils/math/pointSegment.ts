import * as THREE from 'three';

export const getClosestPointOnSegment = (
  p: THREE.Vector3,
  a: THREE.Vector3,
  b: THREE.Vector3,
  { clamped = true }: { clamped?: boolean } = {}
) => {
  const ba = new THREE.Vector3().subVectors(b, a);
  const pa = new THREE.Vector3().subVectors(p, a);
  const h = pa.dot(ba) / ba.dot(ba); // ba.dot(ba) is the length squared of the segment ba
  const hClamped = Math.max(0, Math.min(1, h));
  const closestPoint = new THREE.Vector3().addVectors(a, ba.multiplyScalar(clamped ? hClamped : h));
  return closestPoint;
};

export const getDistanceToClosestPointOnSegment = (
  p: THREE.Vector3,
  a: THREE.Vector3,
  b: THREE.Vector3,
  { clamped = true }: { clamped?: boolean } = {}
) => {
  const closestPoint = getClosestPointOnSegment(p, a, b, { clamped });
  return new THREE.Vector3().subVectors(closestPoint, p).length(); // or closestPoint.distanceTo(p)
};

// getting the distance directly without computing projection
// https://mathworld.wolfram.com/Point-LineDistance3-Dimensional.html
export const getDistanceToClosestPointOnSegment2 = (p: THREE.Vector3, a: THREE.Vector3, b: THREE.Vector3) => {
  const pa = new THREE.Vector3().subVectors(p, a);
  const pb = new THREE.Vector3().subVectors(p, b);
  const ba = new THREE.Vector3().subVectors(b, a);

  // return length(cross(p - a, p - b)) / length(b - a);
  const cross = new THREE.Vector3().crossVectors(pa, pb);
  const lengthCross = cross.length();
  const lengthBA = ba.length();
  const distance = lengthCross / lengthBA;
  return distance;
};

import * as THREE from 'three';
import { LightProbeHelper } from 'three/examples/jsm/helpers/LightProbeHelper';
import { OctreeHelper } from 'three/examples/jsm/helpers/OctreeHelper';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper';
import { PositionalAudioHelper } from 'three/examples/jsm/helpers/PositionalAudioHelper';
import { ViewHelper } from 'three/examples/jsm/helpers/ViewHelper.js';
import { Follower } from 'lib/followers';

export function getBoundingBoxSize(object: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(object, true);
  const size = new THREE.Vector3();
  box.getSize(size);
  return size;
}

export function calculateScaleFactor(assetSize: THREE.Vector3, sceneSize: THREE.Vector3, targetRatio = 0.1) {
  const assetMaxDimension = Math.max(assetSize.x, assetSize.y, assetSize.z);
  if (assetMaxDimension === 0) {
    // some assets like lights, camera have no size
    return 1;
  }
  const sceneMaxDimension = Math.max(sceneSize.x, sceneSize.y, sceneSize.z);
  return (sceneMaxDimension * targetRatio) / assetMaxDimension;
}

const isExcluded = (object: THREE.Object3D, exclude: Set<THREE.Object3D>) => {
  let walker: THREE.Object3D | null = object;
  while (walker) {
    if (
      exclude.has(walker) ||
      // @ts-ignore
      walker.isTransformControlsRoot ||
      walker instanceof THREE.Camera ||
      walker instanceof THREE.Light ||
      walker instanceof THREE.CameraHelper ||
      walker instanceof THREE.SpotLightHelper ||
      walker instanceof THREE.DirectionalLightHelper ||
      walker instanceof THREE.PointLightHelper ||
      walker instanceof THREE.HemisphereLightHelper ||
      walker instanceof LightProbeHelper ||
      walker instanceof RectAreaLightHelper ||
      walker instanceof PositionalAudioHelper ||
      walker instanceof ViewHelper ||
      walker instanceof OctreeHelper ||
      walker instanceof THREE.AxesHelper ||
      walker instanceof THREE.GridHelper ||
      walker instanceof THREE.PolarGridHelper ||
      walker instanceof Follower
    ) {
      return true;
    }
    walker = walker.parent;
  }
  return false;
};

export function getSceneBoundingBoxSize(
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera,
  exclude: Set<THREE.Object3D> = new Set(),
  useFrustum = false
) {
  const frustum = new THREE.Frustum();
  const cameraViewProjectionMatrix = new THREE.Matrix4();

  camera.updateMatrixWorld(); // make sure camera matrices are updated
  cameraViewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  frustum.setFromProjectionMatrix(cameraViewProjectionMatrix);

  const visibleObjectsBoundingBox = new THREE.Box3();
  scene.children.forEach((object) => {
    if (!isExcluded(object, exclude)) {
      const objectBoundingBox = new THREE.Box3().setFromObject(object, true);
      if (!useFrustum || frustum.intersectsBox(objectBoundingBox)) {
        visibleObjectsBoundingBox.union(objectBoundingBox);
      }
    }
  });

  const size = new THREE.Vector3();
  visibleObjectsBoundingBox.getSize(size);
  return size;
}

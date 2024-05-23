import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { LightProbeHelper } from 'three/examples/jsm/helpers/LightProbeHelper';
import { OctreeHelper } from 'three/examples/jsm/helpers/OctreeHelper';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper';
import { PositionalAudioHelper } from 'three/examples/jsm/helpers/PositionalAudioHelper';
import { ViewHelper } from 'three/examples/jsm/helpers/ViewHelper.js';

export function getBoundingBoxSize(object: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  box.getSize(size);
  return size;
}

export function calculateScaleFactor(assetSize: THREE.Vector3, sceneSize: THREE.Vector3, targetRatio = 0.1) {
  const assetMaxDimension = Math.max(assetSize.x, assetSize.y, assetSize.z);
  const sceneMaxDimension = Math.max(sceneSize.x, sceneSize.y, sceneSize.z);
  return (sceneMaxDimension * targetRatio) / assetMaxDimension;
}

const isExcluded = (object: THREE.Object3D, exclude: Set<THREE.Object3D>) => {
  let parent: THREE.Object3D | null = object;
  while (parent) {
    if (
      exclude.has(parent) ||
      parent instanceof TransformControls ||
      parent instanceof THREE.Camera ||
      parent instanceof THREE.Light ||
      parent instanceof THREE.CameraHelper ||
      parent instanceof THREE.SpotLightHelper ||
      parent instanceof THREE.DirectionalLightHelper ||
      parent instanceof THREE.PointLightHelper ||
      parent instanceof THREE.HemisphereLightHelper ||
      parent instanceof LightProbeHelper ||
      parent instanceof RectAreaLightHelper ||
      parent instanceof PositionalAudioHelper ||
      parent instanceof ViewHelper ||
      parent instanceof OctreeHelper
    ) {
      return true;
    }
    parent = parent.parent;
  }
  return false;
};

export function getVisibleSceneBoundingBoxSize(
  scene: THREE.Scene,
  camera: THREE.Camera,
  exclude: Set<THREE.Object3D> = new Set()
) {
  const frustum = new THREE.Frustum();
  const cameraViewProjectionMatrix = new THREE.Matrix4();

  camera.updateMatrixWorld(); // make sure camera matrices are updated
  cameraViewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  frustum.setFromProjectionMatrix(cameraViewProjectionMatrix);

  const visibleObjectsBoundingBox = new THREE.Box3();
  scene.traverse((object) => {
    if (!isExcluded(object, exclude) && !(object instanceof THREE.Scene)) {
      const objectBoundingBox = new THREE.Box3().setFromObject(object);
      if (frustum.intersectsBox(objectBoundingBox)) {
        visibleObjectsBoundingBox.union(objectBoundingBox);
      }
    }
  });

  const size = new THREE.Vector3();
  visibleObjectsBoundingBox.getSize(size);
  return size;
}

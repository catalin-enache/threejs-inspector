import * as THREE from 'three';
import { LightProbeHelper } from 'three/examples/jsm/helpers/LightProbeHelper';
import { OctreeHelper } from 'three/examples/jsm/helpers/OctreeHelper';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper';
import { PositionalAudioHelper } from 'three/examples/jsm/helpers/PositionalAudioHelper';
import { ViewHelper } from 'three/examples/jsm/helpers/ViewHelper.js';
import { Follower } from 'lib/followers';

export function getWorldScreenRatio({
  camera,
  renderer,
  targetPosition,
  referenceDistance
}: {
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer;
  targetPosition: THREE.Vector3;
  referenceDistance?: number;
}) {
  // returns world units per pixel

  const screenHeight = renderer.domElement.clientHeight;

  if (camera instanceof THREE.PerspectiveCamera) {
    const fovInRadians = camera.fov * (Math.PI / 180);
    const distance = referenceDistance ?? camera.position.distanceTo(targetPosition);
    return (2 * distance * Math.tan(fovInRadians / 2)) / screenHeight;
  } else if (camera instanceof THREE.OrthographicCamera) {
    const viewHeight = (camera.top - camera.bottom) / camera.zoom;
    return viewHeight / screenHeight;
  }

  return 1; // fallback
}

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
      walker instanceof Follower ||
      walker instanceof THREE.Box3Helper ||
      walker instanceof THREE.BoxHelper ||
      walker instanceof THREE.SkeletonHelper
    ) {
      return true;
    }
    walker = walker.parent;
  }
  return false;
};

export function getSceneBoundingBoxSize({
  scene,
  camera,
  exclude = new Set(),
  useFrustum = false,
  sceneBBox = new THREE.Box3(),
  sceneSizeV3 = new THREE.Vector3(),
  objects,
  precise = true
}: {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  exclude?: Set<THREE.Object3D>;
  useFrustum?: boolean;
  sceneBBox?: THREE.Box3;
  sceneSizeV3?: THREE.Vector3;
  objects?: THREE.Object3D[];
  precise?: boolean;
}) {
  const frustum = new THREE.Frustum();
  const cameraViewProjectionMatrix = new THREE.Matrix4();

  camera.updateMatrixWorld(); // make sure camera matrices are updated
  cameraViewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  frustum.setFromProjectionMatrix(cameraViewProjectionMatrix);

  (objects ?? scene.children).forEach((object) => {
    if (!isExcluded(object, exclude)) {
      // SkinnedMesh needs updateMatrixWorld when loaded from JSON
      // else the bounding box is wrong (test Jennifer as JSON)
      object.updateMatrixWorld(true);
      const objectBoundingBox = new THREE.Box3().setFromObject(object, precise);
      if (!useFrustum || frustum.intersectsBox(objectBoundingBox)) {
        sceneBBox.union(objectBoundingBox);
      }
    }
  });

  sceneBBox.getSize(sceneSizeV3);
  const sceneSize = Math.max(sceneSizeV3.x, sceneSizeV3.y, sceneSizeV3.z);
  return { sceneSizeV3, sceneBBox, sceneSize };
}

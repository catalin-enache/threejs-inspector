// three-extensions.d.ts
// @ts-ignore
import * as THREE from 'three';
import type { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper';
import type { LightProbeHelper } from 'three/examples/jsm/helpers/LightProbeHelper';
import type { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

type __inspectorData = {
  fullData: any;
  animations: THREE.AnimationClip[];
  hitRedirect: THREE.Object3D;
  picker: THREE.Mesh;
  helper:
    | THREE.SkeletonHelper
    | THREE.SpotLightHelper
    | THREE.CameraHelper
    | RectAreaLightHelper
    | THREE.DirectionalLightHelper
    | THREE.PointLightHelper
    | THREE.HemisphereLightHelper
    | LightProbeHelper
    | THREE.Mesh; // fallback meaningless helper
  isInspectable: boolean;
  useOnPlay: boolean;
  isPicker: boolean;
  currentCamera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  isRecombined: boolean;
  transformControlsRef: { current?: TransformControls | null };
  orbitControlsRef: { current?: OrbitControls | null };
};

declare module 'three' {
  export interface Object3D {
    __inspectorData: __inspectorData;
  }
}

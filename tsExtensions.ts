// three-extensions.d.ts
import * as THREE from 'three';
import type { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper';
import type { LightProbeHelper } from 'three/examples/jsm/helpers/LightProbeHelper';
import type { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { PositionalAudioHelper } from 'three/examples/jsm/helpers/PositionalAudioHelper';

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
    | PositionalAudioHelper
    | THREE.Mesh; // fallback meaningless helper
  isInspectable: boolean;
  useOnPlay: boolean;
  isPicker: boolean;
  isHelper: boolean;
  currentCamera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  isRecombined: boolean;
  transformControlsRef: { current?: TransformControls | null };
  orbitControlsRef: { current?: OrbitControls | null };
  // specific to optimiseAsset flow
  geometryHasBeenIndexed: boolean;
  isDerivedMesh: boolean;
  mainDerivedMesh: THREE.Mesh;
  // specific to optimiseAsset loadModel
  resourceName: string;
  // specific to bindings
  cpMixer: THREE.AnimationMixer;
  cpStartStop: { start: () => void; stop: () => void; clear: () => void };
  cpActions: Map<THREE.AnimationClip, THREE.AnimationAction>;
  __cpCurrentPlayingAction: THREE.AnimationAction | null;
};

declare module 'three' {
  export interface Object3D {
    __inspectorData: Partial<__inspectorData>;
  }
}

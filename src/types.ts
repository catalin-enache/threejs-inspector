import * as THREE from 'three';
import type { LightProbeHelper } from 'three/examples/jsm/helpers/LightProbeHelper';
import type { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper';

export type __inspectorData = {
  fullData: any;
  animations: THREE.AnimationClip[];
  object: THREE.Object3D;
  picker: THREE.Mesh;
  helper:
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
};

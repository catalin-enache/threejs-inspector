import * as THREE from 'three';
import { LightProbeHelper, RectAreaLightHelper } from 'three-stdlib';

export type userData = {
  object: THREE.Object3D;
  picker: THREE.Mesh;
  helper:
    | THREE.SpotLightHelper
    | THREE.CameraHelper
    | RectAreaLightHelper
    | THREE.DirectionalLightHelper
    | THREE.PointLightHelper
    | THREE.HemisphereLightHelper
    | LightProbeHelper;
  isInspectable: boolean;
  useOnPlay: boolean;
};

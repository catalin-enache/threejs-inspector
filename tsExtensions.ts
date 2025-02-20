// three-extensions.d.ts
import * as THREE from 'three';
import type { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper';
import type { LightProbeHelper } from 'three/examples/jsm/helpers/LightProbeHelper';
import type { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { PositionalAudioHelper } from 'three/examples/jsm/helpers/PositionalAudioHelper';
import type { Follower } from 'lib/followers';

export type __inspectorData = {
  fullData: any;
  animations: THREE.AnimationClip[];
  hitRedirect: THREE.Object3D;
  picker: Follower;
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
    | Follower
    | THREE.Mesh; // fallback meaningless helper
  isInspectable: boolean;
  useOnPlay: boolean;
  isPicker: boolean;
  isHelper: boolean;
  isBeingAdded?: boolean;
  updatingMatrixWorld?: boolean;
  updatingWorldMatrix?: boolean;
  currentCamera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  isRecombined: boolean;
  transformControlsRef: { current?: TransformControls | null };
  orbitControlsRef: { current?: OrbitControls | null };
  readonly dependantObjects: THREE.Object3D[];
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

export interface RenderTargetAsJson {
  width: number;
  height: number;
  options: Omit<THREE.RenderTargetOptions, 'depthTexture'> & {
    depthTexture?:
      | (THREE.TextureJSON & {
          imageWidth: number;
          imageHeight: number;
        })
      | null;
  };
}

export interface CubeCameraAsJson extends THREE.Object3DJSON {
  object: THREE.Object3DJSON['object'] & {
    near: number;
    far: number;
    renderTarget: RenderTargetAsJson;
  };
}

declare module 'three' {
  interface Object3D {
    __inspectorData: Partial<__inspectorData>;
    destroy: () => void;
  }

  interface RenderTarget {
    toJSON(meta?: THREE.JSONMeta): RenderTargetAsJson;
  }

  interface CubeCamera {
    toJSON(meta?: THREE.JSONMeta): CubeCameraAsJson;
  }

  interface ObjectLoader {
    // this is the correct signature according to Three.js source code
    parseObject(
      data: unknown,
      geometries: { [key: string]: THREE.InstancedBufferGeometry | THREE.BufferGeometry },
      materials: { [key: string]: THREE.Material },
      textures: { [key: string]: THREE.Texture },
      animations: { [key: string]: THREE.AnimationClip }
    ): THREE.Object3D;
  }
}

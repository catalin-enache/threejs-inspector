import * as THREE from 'three';
import { FolderApi } from 'tweakpane';

export type SceneObjects = {
  scene: THREE.Scene;
  camera: THREE.Camera;
  gl: THREE.WebGLRenderer;
};

export type CommonGetterParams = {
  angleFormat?: 'deg' | 'rad';
  isPlaying?: boolean;
};

export type onChange = (
  {
    object,
    folder,
    bindings,
    sceneObjects
  }: {
    object: any;
    folder: FolderApi;
    bindings: any;
    sceneObjects: SceneObjects;
  },
  evt: { value: any }
) => void;

import * as THREE from 'three';
import { FolderApi } from 'tweakpane';

export type SceneObjects = {
  scene: THREE.Scene;
  camera: THREE.Camera & { manual?: boolean | undefined };
  gl: THREE.WebGLRenderer;
};

export type CommonGetterParams = {
  angleFormat: 'deg' | 'rad';
  isPlaying: boolean;
  sceneObjects: SceneObjects;
};

export type onChange = (
  {
    object,
    folder,
    bindings
  }: {
    object: any;
    folder: FolderApi;
    bindings: any;
  },
  evt: { value: any }
) => void;

import * as THREE from 'three';
import { FolderApi, Pane } from 'tweakpane';
import { type AppStore } from 'src/store';

export type SceneObjects = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  gl: THREE.WebGLRenderer;
};

export type CommonGetterParams = {
  angleFormat: 'deg' | 'rad';
  playingState: AppStore['playingState'];
  pane: { current: Pane | null };
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

export type init = (
  {
    object,
    folder,
    bindings,
    params
  }: {
    object: any;
    folder: FolderApi;
    bindings: any;
    params: CommonGetterParams;
  },
  evt: { value: any }
) => void;

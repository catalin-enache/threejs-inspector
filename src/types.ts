import type THREE from 'three';
import type { SceneObjects } from 'src/scene';

// import type { SceneSize } from './config';
export interface BaseCustomControl {
  type: 'float' | 'integer' | 'select' | 'boolean' | 'button' | 'info';
  name: string;
  value?: any;
  label?: string;
}

export interface CustomInfoControl extends BaseCustomControl {
  type: 'info';
  value?: string;
}

export interface CustomButtonControl extends BaseCustomControl {
  type: 'button';
  value?: number;
  defaultValue?: number;
  step?: number;
  precision?: number;
}

export interface CustomBooleanControl extends BaseCustomControl {
  type: 'boolean';
  value?: boolean;
}

export interface CustomSelectControl extends BaseCustomControl {
  type: 'select';
  value?: string;
  options: string[];
}

export interface CustomFloatControl extends BaseCustomControl {
  type: 'float';
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  nudge?: number;
}

export interface CustomIntegerControl extends BaseCustomControl {
  type: 'integer';
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  nudge?: number;
}

export type CustomControl =
  | CustomFloatControl
  | CustomIntegerControl
  | CustomSelectControl
  | CustomBooleanControl
  | CustomButtonControl
  | CustomInfoControl;

export type CustomControls = Record<string, CustomControl>;

export interface ScreenInfo {
  name: string;
  value: any;
  linkObject?: THREE.Object3D;
  position: { x: number; y: number };
  size?: { width?: number; height?: number };
  color: { bg: string; fg: string };
}

export type ScreenInfos = Record<string, ScreenInfo>;

export type InfoOptions = {
  delta?: boolean;
  distance?: boolean;
  color?: number;
};

export type UserData = {
  translationDistance?: THREE.Vector3;
  isInteractive?: boolean;
  isVisibleFromCamera?: boolean;
  screenInfo?: ScreenInfo;
  lineTo?: { object: THREE.Object3D; color: number; infoOptions?: InfoOptions };
  dependants?: Record<string, THREE.Object3D>;
  scene?: THREE.Scene;
};

export interface InternalContinuousUpdate {
  internalContinuousUpdate: () => void;
}

export interface LiveCycle {
  onRemoved: ({
    parent,
    scene,
    sceneObjects
  }: {
    parent: THREE.Object3D;
    scene: THREE.Scene;
    sceneObjects: SceneObjects;
  }) => void;
  onAdded: ({
    parent,
    scene,
    sceneObjects
  }: {
    parent: THREE.Object3D;
    scene: THREE.Scene;
    sceneObjects: SceneObjects;
  }) => void;
}

export function isInternalContinuousUpdate(
  object: any
): object is InternalContinuousUpdate {
  return 'internalContinuousUpdate' in object;
}

export function hasLiveCycle(object: any): object is LiveCycle {
  return 'onRemoved' in object;
}

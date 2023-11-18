import type THREE from 'three';
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
  linkObject: THREE.Object3D;
  position: { x: number; y: number };
  size: { width: number; height: number };
  color: { bg: string; fg: string };
}

export type ScreenInfos = Record<string, ScreenInfo>;

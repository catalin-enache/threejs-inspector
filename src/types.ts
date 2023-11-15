/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
export interface BaseCustomControl {
  type: 'float' | 'integer' | 'select' | 'boolean' | 'button';
  name: string;
  value?: any;
  label?: string;
}

export interface CustomButtonControl extends BaseCustomControl {
  type: 'button';
}

export interface CustomBooleanControl extends BaseCustomControl {
  type: 'boolean';
  value?: boolean;
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

export interface CustomSelectControl extends BaseCustomControl {
  type: 'select';
  options: string[];
}

export type CustomControl =
  | CustomFloatControl
  | CustomIntegerControl
  | CustomSelectControl
  | CustomBooleanControl
  | CustomButtonControl;

export type CustomControls = Record<string, CustomControl>;

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

// three-extensions.d.ts
// @ts-ignore
import * as THREE from 'three';
declare module 'three' {
  export interface Object3D {
    __inspectorData: Record<string, any>; // Define __inspectorData as an optional property of any type
  }
}

import * as THREE from 'three';

export type BufferAttributeConstructor = new (
  array: ArrayLike<number>,
  itemSize: number,
  normalized?: boolean
) => THREE.BufferAttribute;

export interface TypedArrayConstructor {
  new (): THREE.TypedArray;
  new (length: number): THREE.TypedArray;
  new (array: ArrayLike<number>): THREE.TypedArray;
  new (buffer: ArrayBuffer, byteOffset?: number, length?: number): THREE.TypedArray;
  BYTES_PER_ELEMENT: number;
}

export type TextureImage =
  | HTMLImageElement
  | { data: Uint8Array; width: number; height: number }
  | { data: Uint16Array; width: number; height: number };

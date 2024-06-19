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

export const isTextureImage = (obj: any): obj is TextureImage => {
  if (!obj) return false;
  return (
    (obj instanceof HTMLImageElement || obj.data instanceof Uint8Array || obj.data instanceof Uint16Array) &&
    typeof obj.width === 'number' &&
    typeof obj.height === 'number'
  );
};

export const isValidTexture = (obj: any): obj is THREE.Texture => {
  // ImageTexture or DataTexture or CubeTexture
  // @ts-ignore
  return obj instanceof THREE.Texture && (obj.image?.width || obj.images?.[0]?.image?.width || obj.images?.[0]?.width);
};

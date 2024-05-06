import * as THREE from 'three';
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
  return obj instanceof THREE.Texture && obj.image;
};

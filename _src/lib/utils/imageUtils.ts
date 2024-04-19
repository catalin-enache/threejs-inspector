import * as THREE from 'three';
import { EXRLoader, TGALoader } from 'three-stdlib';
// @ts-ignore
import { TIFFLoader } from 'three/examples/jsm/loaders/TIFFLoader';

export const FILE_EXR = 'image/x-exr';
export const FILE_GIF = 'image/gif';
export const FILE_JPEG = 'image/jpeg';
export const FILE_PNG = 'image/png';
export const FILE_TIFF = 'image/tiff';
export const FILE_WEBP = 'image/webp';
export const FILE_TGA = 'image/tga';
export const FILE_UNKNOWN = 'unknown';

export const fileTypeMap: Record<string, string> = {
  jpg: FILE_JPEG,
  jpeg: FILE_JPEG,
  png: FILE_PNG,
  webp: FILE_WEBP,
  gif: FILE_GIF,
  tiff: FILE_TIFF,
  tif: FILE_TIFF,
  tga: FILE_TGA,
  exr: FILE_EXR
};

export const getFileType = (filename: string): string => {
  return (
    fileTypeMap[filename.split('.').pop()?.toLowerCase() || ''] || FILE_UNKNOWN
  );
};

export const loadImage = async (
  file: string | File
): Promise<THREE.Texture> => {
  const fileType = getFileType(file instanceof File ? file.name : file);

  let loader = null;
  switch (fileType) {
    case FILE_EXR:
      loader = new EXRLoader();
      break;
    case FILE_TGA:
      loader = new TGALoader();
      break;
    case FILE_TIFF:
      loader = new TIFFLoader();
      break;
    default:
      loader = new THREE.TextureLoader();
      break;
  }

  const url = file instanceof File ? URL.createObjectURL(file) : file;
  const texture = await loader.loadAsync(url);
  URL.revokeObjectURL(url);
  return texture;
};

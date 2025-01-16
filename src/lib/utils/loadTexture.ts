import React from 'react';
import * as THREE from 'three';
import { useAppStore } from 'src/store';
import { getFileNameAndType, getFileType } from './fileUtils';
import {
  tiffLoader,
  exrLoader,
  textureLoader,
  ultraHdrLoader,
  rgbeLoader,
  tgaLoader,
  ktx2Loader,
  pvrLoader,
  ddsLoader,
  registerFiles
} from './loaders';
import { isValidTexture } from 'lib/utils/textureUtils';

export const FILE_EXR = 'image/x-exr';
export const FILE_HDR = 'image/hdr';
export const FILE_GIF = 'image/gif';
export const FILE_JPEG = 'image/jpeg';
export const FILE_PNG = 'image/png';
export const FILE_TIFF = 'image/tiff';
export const FILE_WEBP = 'image/webp';
export const FILE_TGA = 'image/tga';
export const FILE_KTX2 = 'image/ktx2';
export const FILE_PVR = 'image/pvr';
export const FILE_DDS = 'image/vnd-ms.dds';

export const fileTypeMap: Record<string, string> = {
  jpg: FILE_JPEG,
  jpeg: FILE_JPEG,
  png: FILE_PNG,
  gif: FILE_GIF,
  webp: FILE_WEBP,
  tiff: FILE_TIFF,
  tif: FILE_TIFF,
  exr: FILE_EXR,
  hdr: FILE_HDR,
  tga: FILE_TGA,
  ktx2: FILE_KTX2,
  pvr: FILE_PVR,
  dds: FILE_DDS
};

export const isPowerOf2Texture = (texture: THREE.Texture): boolean => {
  const { width, height } = getWidthHeightFromTexture(texture);
  return (width & (width - 1)) === 0 && (height & (height - 1)) === 0; // thanks copilot !! smart
};

export const getWidthHeightFromTexture = (texture: THREE.Texture): { width: number; height: number } => {
  if (!isValidTexture(texture)) {
    console.error('Invalid texture', texture);
    throw new Error('Invalid texture');
  }
  const isCubeTexture = texture instanceof THREE.CubeTexture;
  // texture.image is alias for texture.source.data,
  // source.data can be an image or a buffer having width/height properties
  const width = !isCubeTexture
    ? texture.image.width
    : // CubeTexture has 6 items which can be DataTexture or Image
      texture.images[0] instanceof THREE.DataTexture
      ? texture.images[0].image.width // or texture.images[0].source.data.width
      : texture.images[0].width; // this branch means that CubeTexture has 6 images
  const height = !isCubeTexture
    ? texture.image.height
    : texture.images[0] instanceof THREE.DataTexture
      ? texture.images[0].image.height
      : texture.images[0].height;
  return { width, height };
};

// returns the last 2 characters before the last dot (expecting basically: px, nx, py, ny, pz, nz)
const getCubeCoords = (name: string, size = 2): string => {
  const lastDotIndex = name.lastIndexOf('.');
  return name.substring(lastDotIndex - size, lastDotIndex);
};

export const sortFiles = (files: (File | string)[]): (File | string)[] => {
  // assuming we have files like: <name_>px.<ext>, <name_>nx.<ext>, <name_>py.<ext>, <name_>ny.<ext>, <name_>pz.<ext>, <name_>nz.<ext>
  // also coincidentally the sorting works with: posx, posy, posz, negx, negy, negz, (because "s" comes after "g" same as "p" comes after "n")
  return files.sort((a, b) => {
    // extracting the name from the file object
    const a_name = a instanceof File ? a.name : a;
    const b_name = b instanceof File ? b.name : b;
    // extracting coords from names => px, nx, py, ny, pz, nz
    const a_coord = getCubeCoords(a_name);
    const b_coord = getCubeCoords(b_name);
    // sorting xyz then pn => we need to end up with coords in this order: px, nx, py, ny, pz, nz
    const lastCharComp = a_coord[1].charCodeAt(0) - b_coord[1].charCodeAt(0); // sorting by x/y/z
    if (lastCharComp !== 0) return lastCharComp; // if x/y/z are different, return the comparison, else sort by prev char (p/n or s/g)
    return b_coord[0].charCodeAt(0) - a_coord[0].charCodeAt(0); // sorting by p/n  or s/g
  });
};

export function getImageLoader(fileType: string, fileName: string) {
  switch (fileType) {
    case FILE_EXR:
      return exrLoader;
    case FILE_HDR:
      return rgbeLoader;
    case FILE_TGA:
      return tgaLoader;
    case FILE_TIFF:
      return tiffLoader;
    case FILE_KTX2:
      return ktx2Loader;
    case FILE_PVR:
      return pvrLoader;
    case FILE_DDS:
      return ddsLoader;
    case FILE_JPEG:
      if (fileName.toLowerCase().endsWith('.hdr.jpg')) {
        return ultraHdrLoader;
      } else {
        return textureLoader;
      }
    default:
      return textureLoader;
  }
}

// Assuming all textures have the same characteristics (extension, size, colorSpace, etc.)
export const cubeTextureLoader = async (
  files: (File | string)[],
  { path }: { path?: string } = {}
): Promise<THREE.CubeTexture> => {
  const texture = new THREE.CubeTexture();
  const sortedFiles = sortFiles(files);
  registerFiles(sortedFiles); // takes care of calling URL.createObjectURL(file)
  const textures = (await Promise.all(
    sortedFiles.map((file) => {
      const { fileType, name } = getFileNameAndType(file, fileTypeMap);
      const loader = getImageLoader(fileType, name);
      const oldPath = loader.path ?? '';
      if (path) {
        loader.setPath(path);
      }
      const promise = loader.loadAsync(name);
      loader.setPath(oldPath);
      return promise;
    })
  )) as THREE.Texture[];

  textures.forEach((tempTexture: THREE.Texture, index) => {
    texture.images[index] = tempTexture instanceof THREE.DataTexture ? tempTexture : tempTexture.image;
  });

  const { fileType } = getFileNameAndType(sortedFiles[0], fileTypeMap);
  const isLinear = fileType === FILE_EXR || fileType === FILE_HDR;

  texture.name = sortedFiles[0] instanceof File ? (sortedFiles[0] as File).name : (sortedFiles[0] as string);
  texture.type = textures[0].type;
  texture.format = textures[0].format;
  texture.colorSpace = textures[0].colorSpace || (isLinear ? THREE.LinearSRGBColorSpace : THREE.SRGBColorSpace);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true; // assuming all textures are power of 2 squares (proper cube textures)
  texture.needsUpdate = true;

  return texture;
};

const pnXYZSet = new Set(['px', 'py', 'pz', 'nx', 'ny', 'nz']);
const posNegXYXSet = new Set(['posx', 'posy', 'posz', 'negx', 'negy', 'negz']);

const shouldMakeCubeTexture = (files: (File | string)[]): boolean => {
  const allPX = files.every((file) => {
    const { name } = getFileNameAndType(file, fileTypeMap);
    const coords = getCubeCoords(name);
    return pnXYZSet.has(coords);
  });
  const allSX = files.every((file) => {
    const { name } = getFileNameAndType(file, fileTypeMap);
    const coords = getCubeCoords(name, 4);
    return posNegXYXSet.has(coords);
  });
  return files.length === 6 && (allPX || allSX);
};

type createTexturesFromImagesType = (
  fileOrFiles: string | string[] | File | FileList,
  extra?: {
    material?: THREE.Material | React.MutableRefObject<THREE.Material | null> | null;
    path?: string;
  }
) => Promise<THREE.Texture[]>;

export const createTexturesFromImages: createTexturesFromImagesType = async (
  fileOrFiles,
  { material, path } = {}
): Promise<THREE.Texture[]> => {
  const files = typeof fileOrFiles === 'string' || fileOrFiles instanceof File ? [fileOrFiles] : [...fileOrFiles];
  const needsCubeTexture = shouldMakeCubeTexture(files);
  // TODO: add cors support for images. Can this be integrated with default load manager  ?
  let textures: THREE.Texture[] = [];
  if (needsCubeTexture) {
    textures[0] = await cubeTextureLoader(files, { path });
  } else {
    textures = await Promise.all(
      files.map(async (file) => {
        const isFileType = file instanceof File;
        const name = isFileType ? file.name : file;
        const fileType = getFileType(name, fileTypeMap); // assuming they all have the same extension
        const loader = getImageLoader(fileType, name);
        const oldPath = loader.path ?? '';
        if (path) {
          loader.setPath(path);
        }
        const url = file instanceof File ? URL.createObjectURL(file) : file;
        const texture = (await loader.loadAsync(url)) as any;
        URL.revokeObjectURL(url);
        loader.setPath(oldPath);

        texture.generateMipmaps = isPowerOf2Texture(texture);
        texture.needsUpdate = true;
        texture.name = name;
        return texture;
      })
    );
  }

  if (material && material instanceof THREE.Material) {
    // console.log('loadImage with material', { material });
    setTimeout(() => {
      material.needsUpdate = true;
      setTimeout(() => {
        useAppStore.getState().triggerCPaneStateChanged();
      });
    });
  } else if (material?.current) {
    // console.log('loadImage with material ref', { material });
    setTimeout(() => {
      if (material.current) {
        material.current.needsUpdate = true;
        setTimeout(() => {
          useAppStore.getState().triggerCPaneStateChanged();
        });
      }
    });
  } else {
    // the scene case for background/environment
    setTimeout(() => {
      useAppStore.getState().triggerCPaneStateChanged();
    });
  }

  return textures;
};

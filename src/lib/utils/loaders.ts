import * as THREE from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { TGALoader } from 'three/examples/jsm/loaders/TGALoader';
import { TIFFLoader } from 'three/examples/jsm/loaders/TIFFLoader';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';
import { HDRJPGLoader } from '@monogrid/gainmap-js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module';

import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { ColladaLoader, Collada } from 'three/examples/jsm/loaders/ColladaLoader';

export {
  MeshoptDecoder,
  EXRLoader,
  RGBELoader,
  TGALoader,
  TIFFLoader,
  KTX2Loader,
  HDRJPGLoader,
  DRACOLoader,
  GLTFLoader,
  FBXLoader,
  PLYLoader,
  OBJLoader,
  MTLLoader,
  STLLoader,
  ColladaLoader
};

export type { GLTF, Collada };

export const defaultLoadingManager = THREE.DefaultLoadingManager;

export const objectURLs: string[] = [];
export const blobs: Record<string, Blob> = {};

// defaultLoadingManager.onLoad takes care of cleaning up objectURLs and blobs
export const registerFiles = (files: (File | string)[]) => {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file instanceof File) {
      blobs[file.name] = file;
    }
  }
};

// inspired from https://github.com/donmccurdy/three-gltf-viewer/blob/main/src/viewer.js#L159-L191
// https://gltf-viewer.donmccurdy.com/
defaultLoadingManager.setURLModifier((resource) => {
  // console.log('defaultLoadingManager setURLModifier', { resource, blobs });
  const normalizedResource = resource.replace(/^.*[\\/]/, '');
  if (!blobs[normalizedResource]) return resource;
  const url = URL.createObjectURL(blobs[normalizedResource]);
  objectURLs.push(url);
  // console.log('loadModel setURLModifier done', { resource, normalizedResource, url, blobs });
  return url;
});

defaultLoadingManager.onLoad = () => {
  // console.log('defaultLoadingManager onLoad', { objectURLs, blobs });
  objectURLs.forEach((url) => URL.revokeObjectURL(url));
  objectURLs.length = 0;
  Object.keys(blobs).forEach((key) => {
    delete blobs[key];
  });
};

const gl = new THREE.WebGLRenderer({ antialias: true });

// Texture loaders

export const exrLoader = new EXRLoader(defaultLoadingManager);
export const rgbeLoader = new RGBELoader(defaultLoadingManager);
export const tgaLoader = new TGALoader(defaultLoadingManager);
export const tiffLoader = new TIFFLoader(defaultLoadingManager);
export const ktx2Loader = new KTX2Loader(defaultLoadingManager).setTranscoderPath('libs/basis/').detectSupport(gl);
// The gl renderer will be set to the actual scene renderer where the loader is used (currently imageUtils.ts).
// An ad-hoc renderer like the gl before doesn't work as it works for ktx2Loader.
export const hdrJpgLoader = new HDRJPGLoader(undefined, defaultLoadingManager);
export const textureLoader = new THREE.TextureLoader(defaultLoadingManager);

// Model loaders
export const dracoLoader = new DRACOLoader(defaultLoadingManager).setDecoderPath('libs/draco/gltf/');
export const gltfLoader = new GLTFLoader(defaultLoadingManager)
  .setCrossOrigin('anonymous')
  .setDRACOLoader(dracoLoader)
  .setKTX2Loader(ktx2Loader)
  .setMeshoptDecoder(MeshoptDecoder);
export const fbxLoader = new FBXLoader(defaultLoadingManager).setCrossOrigin('anonymous');
export const plyLoader = new PLYLoader(defaultLoadingManager).setCrossOrigin('anonymous');
export const objLoader = new OBJLoader(defaultLoadingManager).setCrossOrigin('anonymous');
export const mtlLoader = new MTLLoader(defaultLoadingManager).setCrossOrigin('anonymous');
export const stlLoader = new STLLoader(defaultLoadingManager).setCrossOrigin('anonymous');
export const colladaLoader = new ColladaLoader(defaultLoadingManager).setCrossOrigin('anonymous');

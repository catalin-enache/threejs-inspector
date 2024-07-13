import * as THREE from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { TGALoader } from 'three/examples/jsm/loaders/TGALoader';
import { TIFFLoader } from 'three/examples/jsm/loaders/TIFFLoader';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';
import { DDSLoader } from 'three/examples/jsm/loaders/DDSLoader';
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

export const loadingManager = new THREE.LoadingManager();

export const objectURLs: string[] = [];
export const blobs: Record<string, Blob> = {};

// defaultLoadingManager.onLoad takes care of cleaning up objectURLs and blobs
export const registerFiles = (files: (File | string)[]) => {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file instanceof File) {
      blobs[decodeURI(file.name)] = file;
    }
  }
};

// inspired from https://github.com/donmccurdy/three-gltf-viewer/blob/main/src/viewer.js#L159-L191
// https://gltf-viewer.donmccurdy.com/
loadingManager.setURLModifier((resource) => {
  // console.log('defaultLoadingManager setURLModifier', { resource, blobs });
  const normalizedResource = decodeURI(resource).replace(/^.*[\\/]/, '');
  if (!blobs[normalizedResource]) return resource;
  const url = URL.createObjectURL(blobs[normalizedResource]);
  objectURLs.push(url);
  // console.log('loadModel setURLModifier done', { resource, normalizedResource, url, blobs });
  return url;
});

loadingManager.onLoad = () => {
  // console.log('defaultLoadingManager onLoad', { objectURLs, blobs });
  objectURLs.forEach((url) => URL.revokeObjectURL(url));
  objectURLs.length = 0;
  Object.keys(blobs).forEach((key) => {
    delete blobs[key];
  });
};

const gl = new THREE.WebGLRenderer({ antialias: true });

// Texture loaders

export const exrLoader = new EXRLoader(loadingManager);
export const rgbeLoader = new RGBELoader(loadingManager);
export const tgaLoader = new TGALoader(loadingManager);
export const ddsLoader = new DDSLoader(loadingManager);
export const tiffLoader = new TIFFLoader(loadingManager);
export const ktx2Loader = new KTX2Loader(loadingManager).setTranscoderPath('libs/basis/').detectSupport(gl);
// The gl renderer will be set to the actual scene renderer where the loader is used (currently imageUtils.ts).
// An ad-hoc renderer like the gl before doesn't work as it works for ktx2Loader.
export const hdrJpgLoader = new HDRJPGLoader(undefined, loadingManager);
export const textureLoader = new THREE.TextureLoader(loadingManager);

loadingManager.addHandler(/\.tga$/i, tgaLoader);
loadingManager.addHandler(/\.dds$/i, ddsLoader);
loadingManager.addHandler(/\.exr$/i, exrLoader);
loadingManager.addHandler(/\.hdr$/i, rgbeLoader);
loadingManager.addHandler(/\.ktx2$/i, ktx2Loader);
loadingManager.addHandler(/\.tif$/i, tiffLoader);
loadingManager.addHandler(/\.tiff$/i, tiffLoader);

// Model loaders
export const dracoLoader = new DRACOLoader(loadingManager).setDecoderPath('libs/draco/gltf/');
export const gltfLoader = new GLTFLoader(loadingManager)
  .setCrossOrigin('anonymous')
  .setDRACOLoader(dracoLoader)
  .setKTX2Loader(ktx2Loader)
  .setMeshoptDecoder(MeshoptDecoder);
export const fbxLoader = new FBXLoader(loadingManager).setCrossOrigin('anonymous');
export const plyLoader = new PLYLoader(loadingManager).setCrossOrigin('anonymous');
export const objLoader = new OBJLoader(loadingManager).setCrossOrigin('anonymous');
export const mtlLoader = new MTLLoader(loadingManager).setCrossOrigin('anonymous');
export const stlLoader = new STLLoader(loadingManager).setCrossOrigin('anonymous');
export const colladaLoader = new ColladaLoader(loadingManager).setCrossOrigin('anonymous');

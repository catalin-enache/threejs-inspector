import * as THREE from 'three';
import { ObjectLoader, FileLoader } from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { TGALoader } from 'three/examples/jsm/loaders/TGALoader';
import { TIFFLoader } from 'three/examples/jsm/loaders/TIFFLoader';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';
import { PVRLoader } from 'three/examples/jsm/loaders/PVRLoader';
import { DDSLoader } from 'three/examples/jsm/loaders/DDSLoader';
import { UltraHDRLoader } from 'three/examples/jsm/loaders/UltraHDRLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module';

import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { ColladaLoader, Collada } from 'three/examples/jsm/loaders/ColladaLoader';
import { TIFMKObjectLoader } from './TIFMKObjectLoader';

export {
  MeshoptDecoder,
  EXRLoader,
  RGBELoader,
  TGALoader,
  TIFFLoader,
  KTX2Loader,
  PVRLoader,
  UltraHDRLoader,
  DRACOLoader,
  GLTFLoader,
  FBXLoader,
  PLYLoader,
  OBJLoader,
  MTLLoader,
  STLLoader,
  ColladaLoader,
  ObjectLoader,
  TIFMKObjectLoader,
  FileLoader
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
  // console.log('loadObject setURLModifier done', { resource, normalizedResource, url, blobs });
  return url;
});

loadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
  window.dispatchEvent(new CustomEvent('TIFMK.LoadingManager.onStart', { detail: { url, itemsLoaded, itemsTotal } }));
};

loadingManager.onLoad = () => {
  objectURLs.forEach((url) => URL.revokeObjectURL(url));
  objectURLs.length = 0;
  Object.keys(blobs).forEach((key) => {
    delete blobs[key];
  });
  window.dispatchEvent(new CustomEvent('TIFMK.LoadingManager.onLoad', { detail: {} }));
};

const gl = new THREE.WebGLRenderer({ antialias: true });

// Texture loaders

export const exrLoader = new EXRLoader(loadingManager);
export const rgbeLoader = new RGBELoader(loadingManager);
export const tgaLoader = new TGALoader(loadingManager);
export const ddsLoader = new DDSLoader(loadingManager);
export const tiffLoader = new TIFFLoader(loadingManager);
export const ktx2Loader = new KTX2Loader(loadingManager).setTranscoderPath('libs/basis/').detectSupport(gl);
export const pvrLoader = new PVRLoader(loadingManager);
export const ultraHdrLoader = new UltraHDRLoader(loadingManager);
export const textureLoader = new THREE.TextureLoader(loadingManager);

loadingManager.addHandler(/\.tga$/i, tgaLoader);
loadingManager.addHandler(/\.dds$/i, ddsLoader);
loadingManager.addHandler(/\.exr$/i, exrLoader);
loadingManager.addHandler(/\.hdr$/i, rgbeLoader);
loadingManager.addHandler(/\.hdr\.jpg$/i, ultraHdrLoader);
loadingManager.addHandler(/\.ktx2$/i, ktx2Loader);
loadingManager.addHandler(/\.pvr$/i, pvrLoader);
loadingManager.addHandler(/\.tif$/i, tiffLoader);
loadingManager.addHandler(/\.tiff$/i, tiffLoader);

// paths to .wasm locations must start with "libs/" and not "/libs/" in order to work on gh-pages and with apps not running on the domain root

// Model loaders
export const dracoLoader = new DRACOLoader(loadingManager).setDecoderPath('libs/draco/');
export const dracoLoaderForGLTF = new DRACOLoader(loadingManager).setDecoderPath('libs/draco/gltf/');

export const gltfLoader = new GLTFLoader(loadingManager)
  .setCrossOrigin('anonymous')
  .setDRACOLoader(dracoLoaderForGLTF)
  .setKTX2Loader(ktx2Loader)
  .setMeshoptDecoder(MeshoptDecoder);
export const fbxLoader = new FBXLoader(loadingManager).setCrossOrigin('anonymous');
export const plyLoader = new PLYLoader(loadingManager).setCrossOrigin('anonymous');
export const objLoader = new OBJLoader(loadingManager).setCrossOrigin('anonymous');
export const mtlLoader = new MTLLoader(loadingManager).setCrossOrigin('anonymous');
export const stlLoader = new STLLoader(loadingManager).setCrossOrigin('anonymous');
export const colladaLoader = new ColladaLoader(loadingManager).setCrossOrigin('anonymous');
export const objectLoader = new ObjectLoader(loadingManager).setCrossOrigin('anonymous');
export const tifmkObjectLoader = new TIFMKObjectLoader(loadingManager).setCrossOrigin('anonymous');
export const fileLoader = new FileLoader(loadingManager).setCrossOrigin('anonymous');

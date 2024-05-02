import * as THREE from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { TGALoader } from 'three/examples/jsm/loaders/TGALoader';
import { TIFFLoader } from 'three/examples/jsm/loaders/TIFFLoader';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';
import { HDRJPGLoader } from '@monogrid/gainmap-js';

export const defaultLoadingManager = THREE.DefaultLoadingManager;

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

import * as THREE from 'three';
import { getNameAndType } from '.';
import type { GLTF, Collada } from './loaders';
import {
  registerFiles,
  gltfLoader,
  fbxLoader,
  plyLoader,
  objLoader,
  stlLoader,
  colladaLoader,
  GLTFLoader,
  FBXLoader,
  STLLoader,
  OBJLoader,
  PLYLoader,
  ColladaLoader
} from './loaders';

export const FILE_FBX = 'FBX';
export const FILE_PLY = 'PLY';
export const FILE_GLTF = 'GLTF';
export const FILE_GLTF_BINARY = 'GLTF_BINARY';
export const FILE_OBJ = 'OBJ';
export const FILE_STL = 'STL';
export const FILE_COLLADA = 'COLLADA';

export const fileTypeMap: Record<string, string> = {
  fbx: FILE_FBX,
  ply: FILE_PLY,
  glb: FILE_GLTF_BINARY,
  gltf: FILE_GLTF,
  obj: FILE_OBJ,
  stl: FILE_STL,
  dae: FILE_COLLADA
};

export const getLoader = (fileType: string) => {
  switch (fileType) {
    case FILE_FBX:
      return fbxLoader;
    case FILE_PLY:
      return plyLoader;
    case FILE_GLTF:
    case FILE_GLTF_BINARY:
      return gltfLoader;
    case FILE_OBJ:
      return objLoader;
    case FILE_STL:
      return stlLoader;
    case FILE_COLLADA:
      return colladaLoader;
    default:
      return null;
  }
};

const registerMesh = (child: THREE.Mesh, mesh: THREE.Object3D | null, scene: THREE.Scene) => {
  if (!mesh) return;
  child.castShadow = true;
  child.receiveShadow = true;
  child.userData.object = mesh; // proxy raycaster hit to parent
  scene.userData.inspectableObjects[child.uuid] = child;
};

const collectAnimationsAndRegisterMesh = (
  mesh: THREE.Object3D,
  result: THREE.Group<THREE.Object3DEventMap> | THREE.BufferGeometry<THREE.NormalBufferAttributes> | GLTF | Collada,
  scene: THREE.Scene
) => {
  mesh.userData.animations = [...((result as GLTF).animations || [])];
  mesh.traverse(function (child) {
    if (child === mesh) return; // for fbx
    if (child.animations && child.animations.length) {
      // did not encounter so far animations on the mesh itself, only in the root. Logging just in case for awareness.
      console.log('animation found while traversing mesh', { child, animations: child.animations });
      // @ts-ignore -- how could the mesh be null here ?
      mesh.userData.animations.push(...child.animations);
    }
    if (child instanceof THREE.Mesh) {
      registerMesh(child, mesh, scene);
    }
  });
};

// to copy a model locally and ensure it is well constructed example:
// gltf-transform cp https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/AnisotropyBarnLamp/glTF-KTX-BasisU/AnisotropyBarnLamp.gltf out/lamp.gltf --allow-http
// https://github.com/mrdoob/three.js/issues/28258
export const loadModel = async (
  file: File | string,
  scene: THREE.Scene,
  { filesArray = [] }: { filesArray?: (File | string)[] } = {}
) => {
  const isFileType = file instanceof File;
  const resource = isFileType ? file.name : file;
  const { name, fileType } = getNameAndType(resource, fileTypeMap);
  const loader = getLoader(fileType);

  if (!loader) return null;

  registerFiles(filesArray);

  const result = await loader.loadAsync(resource);
  // console.log('loadModel start', { name, fileType, result });
  let mesh: THREE.Object3D | THREE.Group | null = null;
  if (loader instanceof GLTFLoader) {
    mesh = (result as GLTF).scene;
    collectAnimationsAndRegisterMesh(mesh, result, scene);
  } else if (loader instanceof FBXLoader) {
    mesh = result as THREE.Group<THREE.Object3DEventMap>;
    collectAnimationsAndRegisterMesh(mesh, result, scene);
  } else if (loader instanceof OBJLoader) {
    mesh = result as THREE.Group<THREE.Object3DEventMap>;
    mesh.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        registerMesh(child, mesh, scene);
      }
    });
  } else if (loader instanceof PLYLoader || loader instanceof STLLoader) {
    // TODO: add default textures and make it a PhysicalMaterial
    const material = new THREE.MeshStandardMaterial();
    const geometry = result as THREE.BufferGeometry;
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    mesh = new THREE.Mesh(geometry, material);
    mesh.userData.isInspectable = true;
  } else if (loader instanceof GLTFLoader) {
    mesh = (result as GLTF).scene;
    mesh.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        registerMesh(child, mesh, scene);
      }
    });
  } else if (loader instanceof ColladaLoader) {
    mesh = (result as Collada).scene as unknown as THREE.Group;
    mesh.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        registerMesh(child, mesh, scene);
      }
    });
  }

  if (!mesh) return null;
  console.log('loadModel done', { name, fileType, mesh });
  mesh.name = name;
  mesh.scale.set(0.001, 0.001, 0.001);
  mesh.userData.fullData = result;
  return mesh;
};

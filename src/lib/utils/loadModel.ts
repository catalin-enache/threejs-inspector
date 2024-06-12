import * as THREE from 'three';
import { getNameAndType } from '.';
import type { GLTF, Collada } from './loaders';
import {
  registerFiles,
  gltfLoader,
  fbxLoader,
  plyLoader,
  objLoader,
  mtlLoader,
  stlLoader,
  colladaLoader,
  GLTFLoader,
  FBXLoader,
  STLLoader,
  OBJLoader,
  PLYLoader,
  ColladaLoader
} from './loaders';
import { splitMeshesByMaterial, toIndexedGeometry } from './optimiseAsset';
import { getBoundingBoxSize, calculateScaleFactor, getVisibleSceneBoundingBoxSize } from './sizeUtils';

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

const registerMesh = (mesh: THREE.Object3D, isInspectable: boolean) => {
  if (isInspectable) {
    mesh.__inspectorData.isInspectable = isInspectable;
  }

  mesh.traverse(function (child) {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
};

const collectDescendantAnimationsIfAny = (mesh: THREE.Group | THREE.Mesh) => {
  mesh.traverse(function (child) {
    if (child === mesh) return;
    if (child.animations?.length) {
      // did not encounter so far animations on the descendant mesh itself, only in the root. Logging just in case for awareness.
      console.log('animation found while traversing mesh', { child, animations: child.animations });
      mesh.animations.push(...child.animations);
    }
  });
};

const findRootAsset = (roots: THREE.Group<THREE.Object3DEventMap>[]) => {
  // the root should be the one with the most meshes
  const map = new Map<THREE.Group<THREE.Object3DEventMap>, number>();
  roots.forEach((root) => {
    root.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        map.set(root, (map.get(root) || 0) + 1);
      }
    });
  });
  const max = Math.max(...Array.from(map.values()));
  const root = Array.from(map.entries()).find(([_, value]) => value === max)!;
  return root[0];
};

const areAnimationChildrenTargetingMainChildren = (
  main: THREE.Group<THREE.Object3DEventMap>,
  secondary: THREE.Group<THREE.Object3DEventMap>
) => {
  return secondary.children.every((sChild) => {
    let isTargeting = false;
    main.traverse((mChild) => {
      if (mChild.name === sChild.name) {
        isTargeting = true;
      }
    });
    return isTargeting;
  });
};

const mergeAnimationsFromRestAssets = (
  main: THREE.Group<THREE.Object3DEventMap>,
  sec: THREE.Group<THREE.Object3DEventMap>
) => {
  Object.keys(main).forEach((key) => {
    if (key === 'animations') {
      // mixamo fbx animation file has children having the same name as one of the main children.
      // Not sure if this is a requirement or not, or should we just merge animations without checking
      // when we have multiple fbx files.
      if (areAnimationChildrenTargetingMainChildren(main, sec)) {
        sec.animations.forEach((animation) => {
          animation.name = `${animation.name} from ${sec.__inspectorData.resourceName}`;
          main.animations.push(animation);
        });
      }
    }
  });
};

// TODO: check a foliage model to see how it works
// TODO: loading a FBX (uppercase) file does not work. It is case sensitive. Need to fix it.
// TODO: Check the hair between Mixamo Jennifer fbx and gltf. See why hair material is better handled by gltf.

// to copy a model locally and ensure it is well constructed example:
// gltf-transform cp https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/AnisotropyBarnLamp/glTF-KTX-BasisU/AnisotropyBarnLamp.gltf out/lamp.gltf --allow-http
// https://github.com/mrdoob/three.js/issues/28258
export const loadModel = async (
  rootFile: File | string,
  scene: THREE.Scene,
  {
    filesArray = [],
    changeGeometry,
    recombineByMaterial = true,
    autoScaleRatio = 0.4,
    isInspectable = true,
    resourcePath,
    debug
  }: {
    filesArray?: (File | string)[];
    changeGeometry?: 'indexed' | 'non-indexed';
    recombineByMaterial?: boolean;
    autoScaleRatio?: number;
    isInspectable?: boolean;
    resourcePath?: string;
    debug?: 'ALL' | string;
  } = {}
) => {
  const rootSource = rootFile instanceof File ? rootFile.name : rootFile;
  let { name, fileType } = getNameAndType(rootSource, fileTypeMap);

  debug &&
    console.log('loadModel start', {
      name,
      fileType,
      rootSource,
      filesArray,
      changeGeometry,
      autoScaleRatio,
      recombineByMaterial,
      resourcePath,
      isInspectable,
      debug
    });

  const loader = getLoader(fileType);
  if (!loader) return null;

  if (resourcePath) {
    loader.setResourcePath(resourcePath);
  }

  registerFiles(filesArray); // if filesArray has items it also contains the rootFile
  const sources = [...new Set(filesArray.concat(rootSource).map((f) => (f instanceof File ? f.name : f)))];

  const mtlSource = sources.find((resource) => resource.toLowerCase().endsWith('.mtl'));
  if (mtlSource) {
    // no need for createObjectURL. DefaultManager takes care of it. just extract the resource
    const objMaterials = await mtlLoader.loadAsync(mtlSource);
    objMaterials.preload();
    if (loader instanceof OBJLoader) {
      loader.setMaterials(objMaterials);
    }
  }

  let result: THREE.Group<THREE.Object3DEventMap> | THREE.BufferGeometry<THREE.NormalBufferAttributes> | GLTF | Collada;
  const multiAssetSources = sources.filter((source) =>
    ['.fbx', '.gltf', '.glb'].some((ext) => source.toLowerCase().endsWith(ext))
  );
  // TODO: test loading via http multiple fbx files (with separate animations)

  if (multiAssetSources.length) {
    // dealing with fbx/gltf one or more files
    const loadedAssets = await Promise.all(
      multiAssetSources.map(async (source) => {
        let loaded = await loader.loadAsync(source);
        if (loader instanceof GLTFLoader) {
          loaded.scene.__inspectorData.fullData = loaded;
          const { animations } = loaded as GLTF;
          loaded = loaded.scene;
          loaded.animations = animations;
        }
        loaded.__inspectorData.resourceName = source;
        return loaded;
      })
    );

    const rootAsset = findRootAsset(loadedAssets);
    // restAssets most of the time contain just animations
    const restAssets = loadedAssets.filter((a) => a !== rootAsset);
    debug &&
      console.log('loadModel multiAssetSources loadedAssets', { multiAssetSources, sources, loadedAssets, rootAsset });

    result = rootAsset;
    name = rootAsset.__inspectorData.resourceName;

    restAssets.forEach((externalAnimationAsset) => {
      mergeAnimationsFromRestAssets(result as THREE.Group, externalAnimationAsset);
    });

    debug && console.log('loadModel multiAssetSources merged animations', { rootAsset, restAssets });
  } else {
    // the rest non fbx, glb, gltf files
    result = await loader.loadAsync(rootSource);
  }

  let root: THREE.Mesh | THREE.Group | null = null;

  if (loader instanceof GLTFLoader) {
    root = result as THREE.Group;
    collectDescendantAnimationsIfAny(root);
  } else if (loader instanceof FBXLoader) {
    root = result as THREE.Group;
    collectDescendantAnimationsIfAny(root);
  } else if (loader instanceof ColladaLoader) {
    root = (result as Collada).scene as unknown as THREE.Group;
    collectDescendantAnimationsIfAny(root);
  } else if (loader instanceof OBJLoader) {
    root = result as THREE.Group;
  } else if (loader instanceof PLYLoader || loader instanceof STLLoader) {
    // TODO: add default textures and make it a PhysicalMaterial
    const material = new THREE.MeshStandardMaterial();
    const geometry = result as THREE.BufferGeometry;
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    const newMesh = new THREE.Mesh(geometry, material);
    newMesh.updateMatrix();
    newMesh.updateMatrixWorld(true);
    root = newMesh;
  }

  if (!root) return null;

  if (changeGeometry === 'indexed') {
    root.traverse((child) => {
      if (child instanceof THREE.Mesh && !child.geometry.index) {
        debug && console.log('loadModel toIndexedGeometry', child);
        toIndexedGeometry(child);
        child.geometry.computeBoundingBox();
        child.geometry.computeBoundingSphere();
      }
    });
  } else if (changeGeometry === 'non-indexed') {
    root.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry.index) {
        debug && console.log('loadModel toNonIndexedGeometry', child);
        child.geometry = child.geometry.toNonIndexed();
        child.geometry.computeBoundingBox();
        child.geometry.computeBoundingSphere();
      }
    });
  }

  // =========== test injecting children ===========

  // const testGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  //
  // const testMaterial = new THREE.MeshStandardMaterial();
  // testMaterial.color.set(0x00ff00);
  //
  // const testMaterialChild = new THREE.MeshStandardMaterial();
  // testMaterialChild.color.set(0xff0000);
  //
  // const testMesh = new THREE.Mesh(
  //   testGeometry.clone(),
  //   testMaterial
  //   // Array.from({ length: testGeometry.groups.length }).map(() => testMaterial)
  // );
  // testMesh.name = 'testMesh';
  // testMesh.position.set(0.5, 0.5, 0.5);
  // const testMeshChild = new THREE.Mesh(
  //   testGeometry.clone(),
  //   testMaterialChild
  //   // Array.from({ length: testGeometry.groups.length }).map(() => testMaterial)
  // );
  // testMeshChild.name = 'testMeshChild';
  // testMeshChild.position.y = 1;
  // testMesh.add(testMeshChild);
  //
  // const existingMeshes: THREE.Mesh[] = [];
  // root.traverse((child) => {
  //   if (child instanceof THREE.Mesh) {
  //     existingMeshes.push(child);
  //   }
  // });
  // existingMeshes.forEach((mesh, index) => {
  //   const clone = testMesh.clone(true);
  //   clone.position.x += index;
  //   mesh.add(clone);
  // });

  // =========== test injecting children end ===========

  root.name = name;

  if (recombineByMaterial) {
    root = splitMeshesByMaterial(root, { debug });
  }

  debug && console.log('loadModel done', { name, fileType, result, root });

  if (autoScaleRatio) {
    const meshSize = getBoundingBoxSize(root);
    const sceneSize = getVisibleSceneBoundingBoxSize(scene, scene.__inspectorData.currentCamera, new Set([root]), true);
    const scaleFactor = calculateScaleFactor(meshSize, sceneSize, autoScaleRatio);
    root.scale.set(scaleFactor, scaleFactor, scaleFactor);
  }

  registerMesh(root, isInspectable);

  return root;
};

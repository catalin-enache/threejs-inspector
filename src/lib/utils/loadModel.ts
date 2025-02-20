import * as THREE from 'three';
import { getFileNameAndType, getFileType } from './fileUtils';
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
  tifmkObjectLoader,
  GLTFLoader,
  MTLLoader,
  FBXLoader,
  STLLoader,
  OBJLoader,
  PLYLoader,
  ColladaLoader,
  TIFMKObjectLoader
} from './loaders';
import { splitMeshesByMaterial, toIndexedGeometry } from './optimiseModel';
import { getBoundingBoxSize, calculateScaleFactor, getSceneBoundingBoxSize } from './sizeUtils';
import { deepTraverse } from 'lib/utils/objectUtils';

export const FILE_FBX = 'FBX';
export const FILE_PLY = 'PLY';
export const FILE_GLTF = 'GLTF';
export const FILE_GLTF_BINARY = 'GLTF_BINARY';
export const FILE_OBJ = 'OBJ';
export const FILE_STL = 'STL';
export const FILE_COLLADA = 'COLLADA';
export const FILE_JSON = 'JSON';
export const FILE_BSON = 'BSON';
export const FILE_EJSON = 'EJSON';

// models extensions
const RootTypesSet = new Set([
  FILE_FBX,
  FILE_PLY,
  FILE_GLTF,
  FILE_GLTF_BINARY,
  FILE_OBJ,
  FILE_STL,
  FILE_COLLADA,
  FILE_JSON,
  FILE_BSON,
  FILE_EJSON
]);

export const fileTypeMap: Record<string, string> = {
  fbx: FILE_FBX,
  ply: FILE_PLY,
  glb: FILE_GLTF_BINARY,
  gltf: FILE_GLTF,
  obj: FILE_OBJ,
  stl: FILE_STL,
  dae: FILE_COLLADA,
  json: FILE_JSON,
  bson: FILE_BSON,
  ejson: FILE_EJSON
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
    case FILE_JSON:
      return tifmkObjectLoader;
    case FILE_BSON:
      return tifmkObjectLoader;
    case FILE_EJSON:
      return tifmkObjectLoader;
    default:
      return null;
  }
};

const configMesh = (mesh: THREE.Object3D) => {
  const isJSONLoaded = (mesh.name || '').toLowerCase().endsWith('.json');
  const isBSONLoaded = (mesh.name || '').toLowerCase().endsWith('.bson');
  const isEJSONLoaded = (mesh.name || '').toLowerCase().endsWith('.ejson');

  if (isJSONLoaded || isBSONLoaded || isEJSONLoaded) {
    deepTraverse(
      mesh,
      ({ value }) => {
        // mesh can be a scene when importing a scene saved as json
        // before exporting to json we copy the isInspectable flag from __inspectorData to userData
        // here we get it back
        if (value?.userData?.isInspectable) {
          value.__inspectorData.isInspectable = true;
        }
        delete value?.userData?.isInspectable;
        value.uuid = THREE.MathUtils.generateUUID();
      },
      ({ value }) => {
        return value?.uuid;
      }
    );
  }
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

  if (!map.size) return null;

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

const configLoader = ({
  loader,
  path,
  resourcePath
}: {
  loader: GLTFLoader | FBXLoader | PLYLoader | OBJLoader | STLLoader | ColladaLoader | MTLLoader | TIFMKObjectLoader;
  path?: string;
  resourcePath?: string;
}): {
  existingLoaderPath: string;
  existingLoaderResourcePath: string;
} => {
  const existingLoaderPath = loader.path ?? '';
  if (path) {
    loader.setPath(path);
  }
  const existingLoaderResourcePath = loader.resourcePath ?? '';
  if (resourcePath) {
    loader.setResourcePath(resourcePath);
  }

  return { existingLoaderPath, existingLoaderResourcePath };
};
const resetLoader = configLoader;

const enhanceLoader = async ({
  loader,
  path,
  resourcePath,
  sources
}: {
  loader: GLTFLoader | FBXLoader | PLYLoader | OBJLoader | STLLoader | ColladaLoader | TIFMKObjectLoader;
  path?: string;
  resourcePath?: string;
  sources?: string[];
}) => {
  const mtlSource = (sources || []).find((resource) => resource.toLowerCase().endsWith('.mtl'));
  if (mtlSource) {
    const { existingLoaderPath, existingLoaderResourcePath } = configLoader({
      loader: mtlLoader,
      path,
      resourcePath
    });
    // no need for createObjectURL. DefaultManager takes care of it. just extract the resource
    const objMaterials = await mtlLoader.loadAsync(mtlSource);
    objMaterials.preload();
    if (loader instanceof OBJLoader) {
      loader.setMaterials(objMaterials); // the enhancement for obj loader
    }
    resetLoader({ loader: mtlLoader, path: existingLoaderPath, resourcePath: existingLoaderResourcePath });
  }
};

// TODO: Check the hair between Mixamo Jennifer fbx and gltf. See why hair material is better handled by gltf.
// TODO: rename this function to loadObject and the file to loadObject.ts
// to copy a model locally and ensure it is well constructed example:
// gltf-transform cp https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/AnisotropyBarnLamp/glTF-KTX-BasisU/AnisotropyBarnLamp.gltf out/lamp.gltf --allow-http
// https://github.com/mrdoob/three.js/issues/28258
export const loadModel = async (
  fileOrFiles: (File | string) | (File | string)[],
  {
    scene,
    camera,
    changeGeometry,
    recombineByMaterial,
    autoScaleRatio,
    path,
    resourcePath,
    getMaterial, // to be used for ply/stl loaders
    debug
  }: {
    scene?: THREE.Scene;
    camera?: THREE.Camera;
    changeGeometry?: 'indexed' | 'non-indexed';
    recombineByMaterial?: boolean;
    autoScaleRatio?: number;
    path?: string;
    resourcePath?: string;
    getMaterial?: (geometry: THREE.BufferGeometry) => THREE.Material;
    debug?: 'ALL' | string;
  } = {}
) => {
  // Files can contain models and textures as well.
  const files = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
  registerFiles(files);
  const sources = [...new Set(files.map((f) => (f instanceof File ? f.name : f)))];

  debug &&
    console.log('loadModel start', {
      changeGeometry,
      autoScaleRatio,
      recombineByMaterial,
      resourcePath,
      debug
    });

  let loader: ReturnType<typeof getLoader>;
  let result:
    | THREE.Group<THREE.Object3DEventMap>
    | THREE.Object3D<THREE.Object3DEventMap>
    | THREE.BufferGeometry<THREE.NormalBufferAttributes>
    | GLTF
    | Collada;
  let fileName: string;
  let fileType: string;

  const multiAssetSources = sources.filter((source) =>
    ['.fbx', '.gltf', '.glb'].some((ext) => source.toLowerCase().endsWith(ext))
  );

  if (multiAssetSources.length) {
    // dealing with fbx/gltf one or more files
    const loadedAssets = await Promise.all(
      multiAssetSources.map(async (source) => {
        const _fileType = getFileType(source, fileTypeMap);
        const _loader = getLoader(_fileType)!;
        const { existingLoaderPath, existingLoaderResourcePath } = configLoader({
          loader: _loader,
          path,
          resourcePath
        });
        let loaded = await _loader.loadAsync(source);
        resetLoader({ loader: _loader, path: existingLoaderPath, resourcePath: existingLoaderResourcePath });
        if (_loader instanceof GLTFLoader) {
          const { animations } = loaded as GLTF;
          loaded = (loaded as GLTF).scene;
          loaded.animations = animations;
        }
        (loaded as THREE.Object3D).__inspectorData.resourceName = source;
        return loaded;
      })
    );

    // @ts-ignore
    const rootAsset = findRootAsset(loadedAssets)!; // the asset holding meshes
    // for multi root files override the fileName, fileType, loader with the ones for the actual rootAsset
    // the fileName is assigned to the root object returned in the end.
    fileType = getFileType((rootAsset as THREE.Object3D).__inspectorData.resourceName!, fileTypeMap);
    fileName = rootAsset.__inspectorData.resourceName!;
    loader = getLoader(fileType);
    result = rootAsset;

    // restAssets most of the time contain just animations
    const restAssets = loadedAssets.filter((a) => a !== rootAsset);
    debug &&
      console.log('loadModel multiAssetSources loadedAssets', { multiAssetSources, sources, loadedAssets, rootAsset });

    restAssets.forEach((externalAnimationAsset) => {
      // @ts-ignore
      mergeAnimationsFromRestAssets(result as THREE.Group, externalAnimationAsset);
    });

    debug && console.log('loadModel multiAssetSources merged animations', { rootAsset, restAssets });
  } else {
    // dealing with NON fbx/gltf one file
    const types = sources.map((source) => getFileType(source, fileTypeMap));
    // @ts-ignore
    const rootType = types.find((type) => RootTypesSet.has(type)); // a model asset
    if (!rootType) {
      console.error('Unknown file type found in sources', sources);
      return null;
    }
    const rootFile = files.find((file) => getFileNameAndType(file, fileTypeMap).fileType === rootType)!;
    const rootSource = rootFile instanceof File ? rootFile.name : rootFile;

    const nameAndFileType = getFileNameAndType(rootFile, fileTypeMap);
    fileName = nameAndFileType.name;
    fileType = nameAndFileType.fileType;
    loader = getLoader(fileType);
    if (!loader) return null;

    await enhanceLoader({ loader, path, resourcePath, sources }); // currently enhancing obj loader with mtl textures

    const { existingLoaderPath, existingLoaderResourcePath } = configLoader({ loader, path, resourcePath });
    // the rest of asset types which are not fbx, glb, gltf files
    result = await loader.loadAsync(rootSource);
    resetLoader({ loader, path: existingLoaderPath, resourcePath: existingLoaderResourcePath });
  }

  if (!loader) return;

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
    const geometry = result as THREE.BufferGeometry;
    const material = getMaterial?.(geometry) || new THREE.MeshStandardMaterial();
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    const newMesh = new THREE.Mesh(geometry, material);
    newMesh.updateMatrix();
    newMesh.updateMatrixWorld(true);
    root = newMesh;
  } else if (loader instanceof TIFMKObjectLoader) {
    root = result as THREE.Group;
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

  root.name = fileName;

  // it seems gltf/glb already does this optimisation at import
  // and this flag only makes a difference for non glb/gltf files (like fbx)
  if (recombineByMaterial) {
    root = splitMeshesByMaterial(root, { debug });
  }

  debug && console.log('loadModel done', { fileName, fileType, result, root });

  if (autoScaleRatio && scene && camera) {
    const meshSize = getBoundingBoxSize(root);
    const sceneSize = getSceneBoundingBoxSize(scene, camera, new Set([root]), true);
    const scaleFactor = calculateScaleFactor(meshSize, sceneSize, autoScaleRatio);
    root.scale.set(scaleFactor, scaleFactor, scaleFactor);
  }

  configMesh(root);

  return root;
};

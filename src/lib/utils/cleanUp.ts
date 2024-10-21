import * as THREE from 'three';

type DestroyOptions = {
  includeMaterials?: boolean;
  includeTextures?: boolean;
  includeGeometries?: boolean;
  includeSkeletons?: boolean;
};

export const destroyObject = (
  object: THREE.Object3D,
  {
    includeMaterials = true,
    includeTextures = true,
    includeGeometries = true,
    includeSkeletons = true
  }: DestroyOptions = {}
) => {
  if (object.__inspectorData?.preventDestroy) {
    return;
  }
  if ('dispose' in object) {
    // @ts-ignore
    object.dispose(); // for helpers
  } else if (object instanceof THREE.Mesh) {
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    includeMaterials &&
      materials.forEach((mat: THREE.Material) => {
        Object.keys(mat).forEach((key) => {
          if ((mat as any)[key] instanceof THREE.Texture) {
            includeTextures && (mat as any)[key].dispose(); // texture dispose
          }
        });
        mat.dispose(); // material dispose
      });
    includeGeometries && object.geometry?.dispose(); // geometry dispose
    // @ts-ignore
    includeSkeletons && object.skeleton?.boneTexture?.dispose();
  }
};

export const destroyObjectRecursively = (object: THREE.Object3D, destroyOptions: DestroyOptions = {}) => {
  object.traverse((child) => {
    destroyObject(child, destroyOptions);
  });
};

export const deepCleanScene = (scene: THREE.Scene) => {
  if (scene.background instanceof THREE.Texture) {
    scene.background.dispose();
  }
  if (scene.environment) {
    scene.environment.dispose();
  }
  scene.background = null;
  scene.environment = null;

  destroyObjectRecursively(scene);

  while (scene.children.length > 0) {
    scene.remove(scene.children[0]);
  }
};

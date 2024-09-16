import * as THREE from 'three';

export function disposeMaterial(material: THREE.Material) {
  for (const key in material) {
    // @ts-ignore
    const value = material[key] ?? {};
    if (value instanceof THREE.Texture) {
      value.dispose();
      // @ts-ignore
      delete value._listeners; // internals to Three, deleting just in case
    }
  }
  material.dispose();
}

export function deepCleanScene(scene: THREE.Scene) {
  if (scene.background instanceof THREE.Texture) {
    scene.background.dispose();
  }
  if (scene.environment) {
    scene.environment.dispose();
  }
  scene.background = null;
  scene.environment = null;

  scene.traverse((object: any) => {
    if (object.geometry) {
      object.geometry.dispose();
    }

    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach((material: THREE.Material) => {
          disposeMaterial(material);
        });
      } else {
        disposeMaterial(object.material);
      }
    }

    if ('dispose' in object) {
      object.dispose();
    }
  });

  while (scene.children.length > 0) {
    scene.remove(scene.children[0]);
  }
}

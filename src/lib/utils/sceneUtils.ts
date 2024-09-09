import * as THREE from 'three';

export function disposeMaterial(material: THREE.Material) {
  for (const key in material) {
    // @ts-ignore
    const value = material[key] ?? {};
    if (value instanceof THREE.Texture) {
      value.dispose();
    }
  }
  material.dispose();
}

export function deepCleanScene(scene: THREE.Scene) {
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

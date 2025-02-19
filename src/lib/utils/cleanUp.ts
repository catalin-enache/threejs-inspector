import * as THREE from 'three';

export function disposeMediaElement(
  media: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement | HTMLAudioElement | ImageBitmap,
  force: boolean = false
) {
  if (media instanceof ImageBitmap) return media.close();

  // If the element is implemented elsewhere in the dom, set "force" to true to remove it
  if (media.parentElement && !force) {
    if (media instanceof HTMLMediaElement) media.pause();
    return;
  }

  if (media instanceof HTMLImageElement || media instanceof HTMLCanvasElement) return media.remove();

  media.pause?.();

  if (media.srcObject) {
    // Stop all MediaStream tracks (User camera, microphone ...)
    if (media.srcObject instanceof MediaStream) media.srcObject.getTracks().forEach((track) => track.stop());
    media.srcObject = null;
  }

  if (media.src) {
    if (media.src.startsWith('blob:')) URL.revokeObjectURL(media.src);
    media.src = '';
  }

  media.remove?.();
}

type DestroyOptions = {
  includeDefaultTransformControls?: boolean;
};

// https://threejs.org/manual/#en/cleanup
// https://discourse.threejs.org/t/three-js-dispose-things-so-hard/46664/7
export const deepClean = (
  object: THREE.Object3D,
  renderer: THREE.WebGLRenderer,
  { includeDefaultTransformControls = false }: DestroyOptions = {}
) => {
  const geometriesSet = new Set<THREE.BufferGeometry>();
  const materialsSet = new Set<THREE.Material>();
  const texturesSet = new Set<THREE.Texture>();
  const skeletonsSet = new Set<THREE.Skeleton>();
  const disposableSet = new Set<THREE.Object3D>();
  const renderTargetsSet = new Set<THREE.WebGLRenderTarget>();

  object.traverse((descendant) => {
    if (descendant.name === 'DefaultTransformControls' && !includeDefaultTransformControls) {
      return;
    }

    if (descendant instanceof THREE.Scene) {
      if (descendant.background instanceof THREE.Texture) {
        descendant.background.dispose();
        descendant.background = null;
      }
      if (descendant.environment instanceof THREE.Texture) {
        descendant.environment.dispose();
        descendant.environment = null;
      }
    }

    if ('dispose' in descendant) {
      disposableSet.add(descendant);
    }

    const descendantAsLight = descendant as THREE.Light;
    const descendantAsMesh = descendant as THREE.Mesh;
    const descendantAsSkinnedMesh = descendant as THREE.SkinnedMesh;

    if (descendantAsLight.isLight && descendantAsLight.shadow && descendantAsLight.shadow.map) {
      renderTargetsSet.add(descendantAsLight.shadow.map);
    }

    if ((descendant as THREE.CubeCamera).renderTarget) {
      renderTargetsSet.add((descendant as THREE.CubeCamera).renderTarget);
      (descendant as THREE.CubeCamera).renderTarget.textures.forEach((texture) => {
        texturesSet.add(texture);
      });
    }

    if (descendantAsMesh.material) {
      const materials = Array.isArray(descendantAsMesh.material)
        ? descendantAsMesh.material
        : [descendantAsMesh.material];
      materials.forEach((mat: THREE.Material) => {
        materialsSet.add(mat);

        Object.keys(mat).forEach((key) => {
          if ((mat as any)[key] instanceof THREE.Texture) {
            texturesSet.add((mat as any)[key]);
            (mat as any)[key] = null;
          }
        });

        const _mat = mat as THREE.ShaderMaterial;

        if (_mat.uniforms) {
          console.log('Cleaning up material found uniforms', { uniforms: _mat.uniforms, obj: descendantAsMesh });
          for (const value of Object.values(_mat.uniforms)) {
            if (value) {
              const uniformValues = Array.isArray(value.value) ? value.value : [value.value];
              uniformValues.forEach((uniformValue) => {
                if (uniformValue instanceof THREE.Texture) {
                  console.log('Cleaning up material disposing uniformValue as Texture', {
                    obj: descendantAsMesh,
                    uniformValue
                  });
                  texturesSet.add(uniformValue);
                }
              });
            }
          }
        }
      });
    }

    if (descendantAsMesh.geometry) {
      geometriesSet.add(descendantAsMesh.geometry);
    }

    if (descendantAsSkinnedMesh.skeleton) {
      skeletonsSet.add(descendantAsSkinnedMesh.skeleton);
    }

    if (descendantAsSkinnedMesh.skeleton && descendantAsSkinnedMesh.skeleton.boneTexture) {
      texturesSet.add(descendantAsSkinnedMesh.skeleton.boneTexture);
    }
  });

  console.log(
    'Disposing of',
    {
      geometries: geometriesSet.size,
      materials: materialsSet.size,
      textures: texturesSet.size,
      skeletons: skeletonsSet.size,
      disposables: disposableSet.size,
      renderTargets: renderTargetsSet.size
    },
    'for object',
    object
  );

  if (object instanceof THREE.Scene) {
    const childrenToRemove = [...object.children].filter((child) => {
      return includeDefaultTransformControls || child.name !== 'DefaultTransformControls'; // exists only in scene
    });

    childrenToRemove.forEach((child) => {
      child.removeFromParent();
    });
  }

  renderTargetsSet.forEach((renderTarget) => {
    renderTarget.dispose();
  });
  renderTargetsSet.clear();

  geometriesSet.forEach((geometry) => {
    geometry.dispose();
  });
  geometriesSet.clear();

  texturesSet.forEach((texture) => {
    if (texture instanceof ImageBitmap) {
      disposeMediaElement(texture, true);
    }
    if (texture.image) {
      const images = Array.isArray(texture.image) ? texture.image : [texture.image];
      images.forEach((image) => {
        if (image) {
          disposeMediaElement(image, true);
        }
      });
    }
    texture.dispose();
  });
  texturesSet.clear();

  materialsSet.forEach((material) => {
    material.dispose();
  });
  materialsSet.clear();

  skeletonsSet.forEach((skeleton) => {
    skeleton.dispose();
  });
  skeletonsSet.clear();

  disposableSet.forEach((disposable) => {
    // @ts-ignore
    disposable.dispose();
  });
  disposableSet.clear();

  setTimeout(() => {
    console.log('Renderer stats', {
      remainingGeometries: renderer.info.memory.geometries,
      remainingTextures: renderer.info.memory.textures,
      scene: object
    });
  });
};

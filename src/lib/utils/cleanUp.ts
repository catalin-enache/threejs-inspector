import * as THREE from 'three';
import { deepTraverse } from './objectUtils';

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

// https://threejs.org/manual/#en/cleanup
// https://discourse.threejs.org/t/three-js-dispose-things-so-hard/46664/7
export const deepClean = (
  object: THREE.Object3D,
  {
    disposeOtherDisposables = true,
    disposeRenderTargets = true,
    disposeTextures = true,
    disposeGeometries = true,
    disposeMaterials = true,
    disposeSkeletons = true,
    removeSceneChildren = true,
    log = false
  }: {
    disposeOtherDisposables?: boolean;
    disposeRenderTargets?: boolean;
    disposeTextures?: boolean;
    disposeGeometries?: boolean;
    disposeMaterials?: boolean;
    disposeSkeletons?: boolean;
    removeSceneChildren?: boolean;
    log?: boolean;
  } = {}
) => {
  const geometriesSet = new Set<THREE.BufferGeometry>();
  const materialsSet = new Set<THREE.Material>();
  const texturesSet = new Set<THREE.Texture>();
  const skeletonsSet = new Set<THREE.Skeleton>();
  const disposableSet = new Set<THREE.Object3D>();
  const renderTargetsSet = new Set<THREE.WebGLRenderTarget>();

  deepTraverse(
    object,
    ({ value }) => {
      if (value instanceof THREE.Texture) {
        texturesSet.add(value);
      } else if (value instanceof THREE.Material) {
        materialsSet.add(value);
      } else if (value instanceof THREE.BufferGeometry) {
        geometriesSet.add(value);
      } else if (value instanceof THREE.Skeleton) {
        skeletonsSet.add(value);
      } else if (value instanceof THREE.WebGLRenderTarget) {
        renderTargetsSet.add(value);
      } else if ('dispose' in value) {
        disposableSet.add(value);
      }
    },
    ({ value }) => {
      return (
        [THREE.BufferGeometry, THREE.Material, THREE.Texture, THREE.Skeleton, THREE.WebGLRenderTarget].some(
          (klass) => value instanceof klass
        ) ||
        (!!value?.dispose && value.dispose === 'function')
      );
    }
  );

  if (object instanceof THREE.Scene) {
    if (object.background instanceof THREE.Texture && disposeTextures) {
      object.background.dispose();
      object.background = null;
    }
    if (object.environment instanceof THREE.Texture && disposeTextures) {
      object.environment.dispose();
      object.environment = null;
    }

    if (removeSceneChildren) {
      const childrenToRemove = [...object.children];
      childrenToRemove.forEach((child) => {
        child.removeFromParent();
      });
    }
  }

  const fullStats = {
    geometries: geometriesSet.size,
    materials: materialsSet.size,
    textures: texturesSet.size,
    skeletons: skeletonsSet.size,
    otherDisposables: disposableSet.size,
    renderTargets: renderTargetsSet.size
  };

  const deletedStats = {
    ...(disposeGeometries ? { geometries: fullStats.geometries } : {}),
    ...(disposeMaterials ? { materials: fullStats.materials } : {}),
    ...(disposeTextures ? { textures: fullStats.textures } : {}),
    ...(disposeSkeletons ? { skeletons: fullStats.skeletons } : {}),
    ...(disposeOtherDisposables ? { otherDisposables: fullStats.otherDisposables } : {}),
    ...(disposeRenderTargets ? { renderTargets: fullStats.renderTargets } : {})
  };

  log && console.log('Disposing of', deletedStats, 'for object', object);

  disposeRenderTargets &&
    renderTargetsSet.forEach((renderTarget) => {
      renderTarget.dispose();
    });
  renderTargetsSet.clear();

  disposeGeometries &&
    geometriesSet.forEach((geometry) => {
      geometry.dispose();
    });
  geometriesSet.clear();

  disposeTextures &&
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

  disposeMaterials &&
    materialsSet.forEach((material) => {
      material.dispose();
    });
  materialsSet.clear();

  disposeSkeletons &&
    skeletonsSet.forEach((skeleton) => {
      skeleton.dispose();
    });
  skeletonsSet.clear();

  disposeOtherDisposables &&
    disposableSet.forEach((disposable) => {
      // @ts-ignore
      disposable.dispose();
    });
  disposableSet.clear();

  return { fullStats, deletedStats };
};

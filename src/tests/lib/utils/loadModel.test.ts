import * as THREE from 'three';
import { expect, describe, it } from 'vitest';
import { withScene } from 'testutils/testScene';
import { loadModel } from 'lib/utils/loadModel';

describe('loadModel', () => {
  describe('FBXLoader', () => {
    it('loads non native textures', { timeout: 5000 }, async () =>
      withScene()(async ({ scene, camera }) => {
        const fbx = await loadModel('with_non_native_textures.fbx', {
          autoScaleRatio: 0.01,
          scene,
          camera,
          path: '/models/MyTests/with_non_native_textures/',
          resourcePath: '/models/MyTests/with_non_native_textures/textures/'
        });

        if (!fbx) {
          throw new Error('Failed to load model');
        }

        scene.add(fbx);

        // using LoadingManager.onLoad to wait after all textures have been loaded
        const onLoad = () => {
          const isOK = fbx.children.every((child) => {
            return ((child as THREE.Mesh).material as THREE.MeshPhongMaterial).map?.source.data.width === 512;
          });
          expect(isOK).toBeTruthy();
          window.removeEventListener('LoadingManager.onLoad', onLoad);
        };

        window.addEventListener('LoadingManager.onLoad', onLoad);
        // await new Promise((resolve) => setTimeout(resolve, 60000));
      })
    );
  });

  describe('when path has spaces', () => {
    it('loads model correctly', { timeout: 5000 }, async () =>
      withScene()(async ({ scene, camera }) => {
        const fbx = await loadModel('asset with space in path.FBX', {
          autoScaleRatio: 0.01,
          scene,
          camera,
          path: '/models/MyTests/having space in path/'
        });
        console.log(fbx);

        if (!fbx) {
          throw new Error('Failed to load model');
        }

        scene.add(fbx);

        // using LoadingManager.onLoad to wait after all textures have been loaded
        const onLoad = () => {
          const isOK = fbx.children.every((child) => {
            return ((child as THREE.Mesh).material as THREE.MeshPhongMaterial).map?.source.data.width === 512;
          });
          expect(isOK).toBeTruthy();
          window.removeEventListener('LoadingManager.onLoad', onLoad);
        };

        window.addEventListener('LoadingManager.onLoad', onLoad);
        // await new Promise((resolve) => setTimeout(resolve, 60000));
      })
    );
  });
});

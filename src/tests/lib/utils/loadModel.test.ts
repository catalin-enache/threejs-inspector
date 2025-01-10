import * as THREE from 'three';
import { expect, describe, it } from 'vitest';
import { withScene } from 'testutils/testScene';
import { loadModel } from 'lib/utils/loadModel';

describe('loadModel', () => {
  describe('FBXLoader', () => {
    it(
      'loads non native textures',
      { timeout: 1000 },
      async () =>
        new Promise<void>((done, rej) => {
          withScene()(async ({ scene, camera }) => {
            const fbx = await loadModel('/models/MyTests/with_non_native_textures/with_non_native_textures.fbx', {
              autoScaleRatio: 0.01,
              scene,
              camera
            });

            if (!fbx) {
              return rej();
            }

            scene.add(fbx);

            // await new Promise((resolve) => setTimeout(resolve, 60000));

            const onLoad = () => {
              const isOK = fbx.children.every((child) => {
                return ((child as THREE.Mesh).material as THREE.MeshPhongMaterial).map?.source.data.width === 512;
              });
              expect(isOK).toBeTruthy();
              window.removeEventListener('LoadingManager.onLoad', onLoad);
              done();
            };

            window.addEventListener('LoadingManager.onLoad', onLoad);
          });
        })
    );
  });
});

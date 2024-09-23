import * as THREE from 'three';
import { expect, describe, it } from 'vitest';
import { withScene } from 'testutils/testScene';
import { loadModel } from 'lib/utils/loadModel';

describe('loadModel', () => {
  describe('FBXLoader', () => {
    it('loads non native textures', () =>
      new Promise<void>((done, rej) => {
        withScene(
          0,
          true
        )(async ({ scene, camera }) => {
          const fbx = await loadModel('/models/MyTests/with_non_native_textures/with_non_native_textures.fbx', {
            autoScaleRatio: 0.01,
            scene,
            camera
          });

          if (!fbx) {
            return rej();
          }

          scene.add(fbx);

          window.addEventListener('LoadingManager.onLoad', () => {
            const isOK = fbx.children.every((child) => {
              return ((child as THREE.Mesh).material as THREE.MeshPhongMaterial).map?.source.data.width === 512;
            });
            expect(isOK).toBeTruthy();
            done();
          });
        });
      }));
  });
});

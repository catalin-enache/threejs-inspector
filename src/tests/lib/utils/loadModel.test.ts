import * as THREE from 'three';
import { expect, describe, it } from 'vitest';
import { withScene } from 'testutils/testScene';
import { loadModel } from 'lib/utils/loadModel';
import { waitFor } from '@testing-library/dom';

describe('loadModel', () => {
  // .fbx
  describe('when fbx file', () => {
    it('loads non native textures - considers resourcePath if provided', { timeout: 5000 }, async () =>
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

        await waitFor(() => expect(fbx.children.length).toBe(5), { timeout: 5000 });
        await waitFor(
          () =>
            expect(
              fbx.children.every(
                (child) => ((child as THREE.Mesh).material as THREE.MeshPhongMaterial).map?.source.data.width === 512
              )
            ),
          { timeout: 5000 }
        );

        // await new Promise((resolve) => setTimeout(resolve, 60000));
      })
    );
  });

  describe('when gltf file', () => {
    it('loads model correctly', { timeout: 5000 }, async () =>
      withScene()(async ({ scene, camera }) => {
        const gltf = await loadModel(['with_non_native_textures.gltf'], {
          autoScaleRatio: 0.1,
          scene,
          camera,
          path: '/models/MyTests/with_non_native_textures/'
        });

        if (!gltf) {
          throw new Error('Failed to load model');
        }

        scene.add(gltf);

        await waitFor(() => expect(gltf.children.length).toBe(1), { timeout: 5000 });
        // @ts-ignore
        await waitFor(() => expect(gltf.children[0].children[0].material.map.image.width).toBe(512), { timeout: 5000 });
        // @ts-ignore
        await waitFor(() => expect(gltf.children[0].children[0].geometry.attributes.position.count).toBe(4), {
          timeout: 5000
        });

        // await new Promise((resolve) => setTimeout(resolve, 60000));
      })
    );
  });

  // .obj + .mtl
  describe('when obj file', () => {
    it('loads obj file including mtl file if provided', { timeout: 5000 }, async () =>
      withScene()(async ({ scene, camera }) => {
        const obj = await loadModel(['female02.obj', 'female02.mtl'], {
          autoScaleRatio: 0.1,
          scene,
          camera,
          path: '/models/FromThreeRepo/obj/female02/'
        });

        if (!obj) {
          throw new Error('Failed to load model');
        }

        scene.add(obj);

        await waitFor(() => expect(obj.children.length).toBe(15), { timeout: 5000 });
        await waitFor(
          () =>
            expect(
              ((obj.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial).map!.image.src.endsWith(
                'obj/female02/03_-_Default1noCulling.JPG'
              )
            ).toBe(true),
          { timeout: 5000 }
        );
        // await new Promise((resolve) => setTimeout(resolve, 60000));
      })
    );
  });

  // .fbx
  describe('when path has spaces', () => {
    it('loads model correctly', { timeout: 5000 }, async () =>
      withScene()(async ({ scene, camera }) => {
        const fbx = await loadModel('asset with space in path.FBX', {
          autoScaleRatio: 0.01,
          scene,
          camera,
          path: '/models/MyTests/having space in path/'
        });

        if (!fbx) {
          throw new Error('Failed to load model');
        }

        scene.add(fbx);

        await waitFor(() => expect(fbx.children.length).toBe(1), { timeout: 5000 });
        await waitFor(
          () =>
            expect(
              fbx.children.every(
                (child) => ((child as THREE.Mesh).material as THREE.MeshPhongMaterial).map?.source.data.width === 512
              )
            ),
          { timeout: 5000 }
        );

        // await new Promise((resolve) => setTimeout(resolve, 60000));
      })
    );
  });

  // .glb
  describe('when animations are external', () => {
    it('they are loaded correctly', { timeout: 5000 }, async () =>
      withScene()(async ({ scene, camera }) => {
        const asset = await loadModel(
          [
            'Jennifer.glb',
            'Animations_gltf/Idle.glb',
            'Animations_gltf/Catwalk_Walk_Forward.glb',
            'Animations_gltf/Running.glb'
          ],
          {
            autoScaleRatio: 0.01,
            scene,
            camera,
            path: '/models/Free/gltf/Mixamo/Jennifer/'
          }
        );

        if (!asset) {
          throw new Error('Failed to load model');
        }

        scene.add(asset);

        await waitFor(() => expect(asset.animations.length).toEqual(3));
        expect(asset.animations[0].name.endsWith('Idle.glb'));
        expect(asset.animations[1].name.endsWith('Catwalk_Walk_Forward.glb'));
        expect(asset.animations[2].name.endsWith('Running.glb'));

        // await new Promise((resolve) => setTimeout(resolve, 60000));
      })
    );
  });

  // TODO: test each type of asset
});

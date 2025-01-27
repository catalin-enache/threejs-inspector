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
          recombineByMaterial: true,
          path: '/models/MyTests/with_non_native_textures/',
          resourcePath: '/models/MyTests/with_non_native_textures/textures/'
        });

        if (!fbx) {
          throw new Error('Failed to load model');
        }

        scene.add(fbx);

        expect(fbx.name).toBe('with_non_native_textures.fbx');
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

  // .gltf
  describe('when gltf file', () => {
    it('loads model correctly', { timeout: 5000 }, async () =>
      withScene()(async ({ scene, camera }) => {
        const gltf = await loadModel(['with_non_native_textures.gltf'], {
          autoScaleRatio: 0.1,
          scene,
          camera,
          recombineByMaterial: true,
          path: '/models/MyTests/with_non_native_textures/'
        });

        if (!gltf) {
          throw new Error('Failed to load model');
        }

        scene.add(gltf);

        expect(gltf.name).toBe('with_non_native_textures.gltf');

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
          recombineByMaterial: true,
          path: '/models/FromThreeRepo/obj/female02/'
        });

        if (!obj) {
          throw new Error('Failed to load model');
        }

        scene.add(obj);

        expect(obj.name).toBe('female02.obj');

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

  // .collada
  describe('when collada file', () => {
    it('loads model correctly including animations', { timeout: 5000 }, async () =>
      withScene()(async ({ scene, camera }) => {
        const collada = await loadModel('elf.dae', {
          autoScaleRatio: 0.1,
          scene,
          camera,
          recombineByMaterial: true,
          path: '/models/FromThreeRepo/collada/elf/'
        });

        if (!collada) {
          throw new Error('Failed to load model elf.dae');
        }

        scene.add(collada);
        expect(collada.name).toBe('elf.dae');
        expect(collada.children.length).toBe(4);
        // @ts-ignore
        await waitFor(() => expect(collada.children[0].material.map.image.src.endsWith('ce.jpg')).toBe(true));

        const collada2 = await loadModel('stormtrooper.dae', {
          autoScaleRatio: 0.1,
          scene,
          camera,
          recombineByMaterial: true,
          path: '/models/FromThreeRepo/collada/stormtrooper/'
        });

        if (!collada2) {
          throw new Error('Failed to load model stormtrooper.dae');
        }

        scene.add(collada2);
        collada2.position.set(100, 0, 0);

        expect(collada2.name).toBe('stormtrooper.dae');
        expect(collada2.children.length).toBe(2);
        expect(collada2.animations.length).toBe(1);

        // await new Promise((resolve) => setTimeout(resolve, 60000));
      })
    );
  });

  // .ply
  describe('when ply file', () => {
    it('loads geometry correctly', { timeout: 5000 }, async () =>
      withScene()(async ({ scene, camera }) => {
        const ply = await loadModel('Lucy100k.ply', {
          autoScaleRatio: 0.1,
          scene,
          camera,
          recombineByMaterial: false,
          path: '/models/FromThreeRepo/ply/lucy/'
        });

        if (!ply) {
          throw new Error('Failed to load model Lucy100k.ply');
        }

        scene.add(ply);
        expect(ply.name).toBe('Lucy100k.ply');
        // @ts-ignore
        expect(ply.geometry.attributes.position.count).toBe(50002);

        // await new Promise((resolve) => setTimeout(resolve, 60000));
      })
    );
  });

  // .stl
  describe('when stl file', () => {
    it('loads geometry correctly', { timeout: 5000 }, async () =>
      withScene()(async ({ scene, camera }) => {
        const stl = await loadModel('colored.stl', {
          autoScaleRatio: 0.1,
          scene,
          camera,
          recombineByMaterial: false,
          path: '/models/FromThreeRepo/stl/colored/',
          // @ts-ignore
          getMaterial: (geometry) => new THREE.MeshPhongMaterial({ opacity: geometry.alpha, vertexColors: true })
        });

        if (!stl) {
          throw new Error('Failed to load model colored.stl');
        }

        scene.add(stl);

        expect(stl.name).toBe('colored.stl');
        // @ts-ignore
        expect(stl.geometry.attributes.position.count).toBe(6468);

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
          recombineByMaterial: true,
          path: '/models/MyTests/having space in path/'
        });

        if (!fbx) {
          throw new Error('Failed to load model');
        }

        scene.add(fbx);
        expect(fbx.name).toBe('asset with space in path.FBX');

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
        const glb = await loadModel(
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
            recombineByMaterial: true,
            path: '/models/Free/gltf/Mixamo/Jennifer/'
          }
        );

        if (!glb) {
          throw new Error('Failed to load model');
        }

        scene.add(glb);
        expect(glb.name).toBe('Jennifer.glb');

        await waitFor(() => expect(glb.animations.length).toEqual(3));
        expect(glb.animations[0].name.endsWith('Idle.glb'));
        expect(glb.animations[1].name.endsWith('Catwalk_Walk_Forward.glb'));
        expect(glb.animations[2].name.endsWith('Running.glb'));

        // await new Promise((resolve) => setTimeout(resolve, 60000));
      })
    );
  });

  // .fbx
  describe('recombineByMaterial', () => {
    describe('when recombineByMaterial is false', () => {
      it('allows one mesh with more materials', { timeout: 5000 }, async () =>
        withScene()(async ({ scene, camera }) => {
          const fbx = await loadModel('test_multi_features.fbx', {
            autoScaleRatio: 0.1,
            scene,
            camera,
            recombineByMaterial: false,
            path: '/models/MyTests/test_multi_features/'
          });

          if (!fbx) {
            throw new Error('Failed to load fbx test_multi_features.fbx');
          }

          scene.add(fbx);
          expect(fbx.name).toBe('test_multi_features.fbx');

          expect(fbx.children.length).toBe(4);
          expect(fbx.children[2].name).toBe('Cylinder');
          // @ts-ignore
          expect(fbx.children[2].material.length).toBe(4);

          // await new Promise((resolve) => setTimeout(resolve, 60000));
        })
      );
    });

    describe('when recombineByMaterial is true', () => {
      it('splits a mesh in how many materials it has', { timeout: 5000 }, async () =>
        withScene()(async ({ scene, camera }) => {
          const fbx = await loadModel('test_multi_features.fbx', {
            autoScaleRatio: 0.1,
            scene,
            camera,
            recombineByMaterial: true, // the only diff compared to the previous test
            path: '/models/MyTests/test_multi_features/'
          });

          if (!fbx) {
            throw new Error('Failed to load fbx test_multi_features.fbx');
          }

          scene.add(fbx);
          expect(fbx.name).toBe('test_multi_features.fbx');

          expect(fbx.children.length).toBe(7);
          expect(fbx.children[2].name).toBe('Cylinder_0');
          expect(fbx.children[3].name).toBe('Cylinder_1');
          expect(fbx.children[4].name).toBe('Cylinder_2');
          expect(fbx.children[5].name).toBe('Cylinder_3');

          // await new Promise((resolve) => setTimeout(resolve, 60000));
        })
      );
    });
  });
});

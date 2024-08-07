import * as THREE from 'three';
import { expect, describe, it, vi } from 'vitest';
import { withScene } from 'testutils/testScene';
import { offlineScene } from 'lib/App/CPanel/offlineScene';
import patchThree from 'lib/App/SetUp/patchThree';

const { isMainScene, isSceneObject } = patchThree;

describe('patchThree', () => {
  describe('__inspectorData', () => {
    describe('isInspectable', () => {
      it('is settable', () =>
        new Promise<void>((done) => {
          withScene(
            0,
            true
          )(async ({ scene: _ }) => {
            const mesh = new THREE.Mesh();
            mesh.__inspectorData.isInspectable = true;
            expect(mesh.__inspectorData.isInspectable).toBeTruthy();
            done();
          });
        }));

      it('is propagated to children', () =>
        new Promise<void>((done) => {
          withScene(
            0,
            true
          )(async ({ scene: _ }) => {
            const parent = new THREE.Object3D();
            const child = new THREE.Object3D();
            const grandchild = new THREE.Object3D();
            parent.add(child);
            child.add(grandchild);
            parent.__inspectorData.isInspectable = true;
            expect(child.__inspectorData.isInspectable).toBeTruthy();
            expect(grandchild.__inspectorData.isInspectable).toBeTruthy();
            done();
          });
        }));

      it('sets hitRedirect to parent if it was not set to something else', () =>
        new Promise<void>((done) => {
          withScene(
            0,
            true
          )(async ({ scene: _ }) => {
            const parent = new THREE.Object3D();
            const child = new THREE.Object3D();
            const grandchild = new THREE.Object3D();
            parent.add(child);
            child.add(grandchild);
            parent.__inspectorData.isInspectable = true;
            expect(child.__inspectorData.hitRedirect).toBe(parent);
            expect(grandchild.__inspectorData.hitRedirect).toBe(parent);
            done();
          });
        }));

      it('does not set hitRedirect if it was set to something else', () =>
        new Promise<void>((done) => {
          withScene(
            0,
            true
          )(async ({ scene: _ }) => {
            const hitRedirect = new THREE.Object3D();
            const parent = new THREE.Object3D();
            const child = new THREE.Object3D();
            const grandchild = new THREE.Object3D();
            parent.add(child);
            child.add(grandchild);
            child.__inspectorData.hitRedirect = hitRedirect;
            parent.__inspectorData.isInspectable = true;
            expect(child.__inspectorData.hitRedirect).toBe(hitRedirect);
            expect(grandchild.__inspectorData.hitRedirect).toBe(hitRedirect);
            done();
          });
        }));
    });

    describe('hitRedirect', () => {
      it('is settable', () =>
        new Promise<void>((done) => {
          withScene(
            0,
            true
          )(async ({ scene: _ }) => {
            const mesh = new THREE.Mesh();
            const hitRedirect = new THREE.Object3D();
            mesh.__inspectorData.hitRedirect = hitRedirect;
            expect(mesh.__inspectorData.hitRedirect).toBe(hitRedirect);
            done();
          });
        }));

      it('is propagated to children overriding prev value', () =>
        new Promise<void>((done) => {
          withScene(
            0,
            true
          )(async ({ scene: _ }) => {
            const hitRedirect = new THREE.Object3D();
            const otherHitRedirect = new THREE.Object3D();
            const parent = new THREE.Object3D();
            const child = new THREE.Object3D();
            const grandchild = new THREE.Object3D();
            parent.add(child);
            child.add(grandchild);
            grandchild.__inspectorData.hitRedirect = otherHitRedirect; // will be overridden by parent
            parent.__inspectorData.hitRedirect = hitRedirect;
            expect(child.__inspectorData.hitRedirect).toBe(hitRedirect);
            expect(grandchild.__inspectorData.hitRedirect).toBe(hitRedirect);
            done();
          });
        }));
    });

    describe('dependantObjects', () => {
      it('is an array already provided', () =>
        new Promise<void>((done) => {
          withScene(
            0,
            true
          )(async ({ scene: _ }) => {
            const mesh = new THREE.Mesh();
            const dependantObject = new THREE.Object3D();
            mesh.__inspectorData.dependantObjects!.push(dependantObject);
            expect(mesh.__inspectorData.dependantObjects).toContain(dependantObject);
            done();
          });
        }));

      it('is not settable', () => {
        withScene(
          0,
          true
        )(async ({ scene: _ }) => {
          const mesh = new THREE.Mesh();
          expect(() => {
            // @ts-expect-error
            mesh.__inspectorData['dependantObjects'] = [];
          }).toThrow();
        });
      });
    });
  });

  describe('isSceneObject', () => {
    it('when object is a main scene object it returns true, esle false', () =>
      new Promise<void>((done) => {
        withScene(
          0,
          true
        )(async ({ scene }) => {
          const mesh1 = new THREE.Mesh();
          const mesh2 = new THREE.Mesh();
          expect(isSceneObject(mesh1)).toBeFalsy();
          expect(isSceneObject(mesh2)).toBeFalsy();
          scene.add(mesh1);
          offlineScene.add(mesh2);
          expect(mesh1.parent instanceof THREE.Scene).toBeTruthy();
          expect(mesh2.parent instanceof THREE.Scene).toBeTruthy();
          expect(isSceneObject(mesh1)).toBeTruthy();
          expect(isSceneObject(mesh2)).toBeFalsy();
          done();
        });
      }));
  });

  describe('isMainScene', () => {
    it('when object is a main scene object it returns true, esle false', () =>
      new Promise<void>((done) => {
        withScene(
          0,
          true
        )(async ({ scene }) => {
          expect(isMainScene(scene)).toBeTruthy();
          expect(isMainScene(offlineScene)).toBeFalsy();
          done();
        });
      }));
  });

  describe('Object3D.prototype.add', () => {
    it('does not call handleObjectAdded when not adding to the scene', () =>
      new Promise<void>((done) => {
        withScene(
          0,
          true
        )(async ({ scene: _ }) => {
          const spy = vi.spyOn(patchThree, 'handleObjectAdded');
          const mesh1 = new THREE.Mesh();
          const mesh2 = new THREE.Mesh();
          mesh1.add(mesh2);
          expect(spy).not.toHaveBeenCalled();
          spy.mockRestore();
          done();
        });
      }));

    it('does not call handleObjectAdded when adding to the offlineScene', () =>
      new Promise<void>((done) => {
        withScene(
          0,
          true
        )(async ({ scene: _ }) => {
          const spy = vi.spyOn(patchThree, 'handleObjectAdded');
          const mesh1 = new THREE.Mesh();
          const mesh2 = new THREE.Mesh();
          mesh1.add(mesh2);
          offlineScene.add(mesh1);
          expect(spy).not.toHaveBeenCalled();
          spy.mockRestore();
          done();
        });
      }));

    it('calls handleObjectAdded when adding to the scene', () =>
      new Promise<void>((done) => {
        withScene(
          0,
          true
        )(async ({ scene }) => {
          const spy = vi.spyOn(patchThree, 'handleObjectAdded');
          const mesh1 = new THREE.Mesh();
          scene.add(mesh1);
          expect(spy).toHaveBeenCalledTimes(1);
          expect(spy).toHaveBeenCalledWith(mesh1);
          spy.mockRestore();
          done();
        });
      }));

    it('calls handleObjectAdded recursively when adding to the scene', () =>
      new Promise<void>((done) => {
        withScene(
          0,
          true
        )(async ({ scene }) => {
          const spy = vi.spyOn(patchThree, 'handleObjectAdded');
          const mesh1 = new THREE.Mesh();
          const mesh2 = new THREE.Mesh();
          const mesh3 = new THREE.Mesh();
          mesh2.add(mesh3);
          mesh1.add(mesh2);
          scene.add(mesh1);
          expect(spy).toHaveBeenCalledTimes(3);
          expect(spy).toHaveBeenNthCalledWith(1, mesh1);
          expect(spy).toHaveBeenNthCalledWith(2, mesh2);
          expect(spy).toHaveBeenNthCalledWith(3, mesh3);
          spy.mockRestore();
          done();
        });
      }));
  });

  describe('Object3D.prototype.remove', () => {
    it('does not call cleanupAfterRemovedObject for children of THREE.CubeCamera', () =>
      new Promise<void>((done) => {
        withScene(
          0,
          true
        )(async ({ scene: _ }) => {
          const spy = vi.spyOn(patchThree, 'cleanupAfterRemovedObject');
          const cubeCamera = new THREE.CubeCamera(0, 0, new THREE.WebGLCubeRenderTarget(0));
          const camera = new THREE.PerspectiveCamera();
          cubeCamera.add(camera);
          cubeCamera.remove(camera);
          expect(spy).not.toHaveBeenCalled();
          spy.mockRestore();
          done();
        });
      }));

    it('calls cleanupAfterRemovedObject even object is not added to the scene', () =>
      new Promise<void>((done) => {
        withScene(
          0,
          true
        )(async ({ scene: _ }) => {
          const spy = vi.spyOn(patchThree, 'cleanupAfterRemovedObject');
          const mesh1 = new THREE.Mesh();
          const mesh2 = new THREE.Mesh();
          mesh1.add(mesh2);
          mesh1.remove(mesh2);
          expect(spy).toHaveBeenCalledTimes(1);
          expect(spy).toHaveBeenCalledWith(mesh2);
          spy.mockRestore();
          done();
        });
      }));

    it('calls cleanupAfterRemovedObject for the objects directly removed, not recursively through children', () =>
      new Promise<void>((done) => {
        withScene(
          0,
          true
        )(async ({ scene }) => {
          const spy = vi.spyOn(patchThree, 'cleanupAfterRemovedObject');
          const mesh1 = new THREE.Mesh();
          const mesh2 = new THREE.Mesh();
          const mesh3 = new THREE.Mesh();
          mesh2.add(mesh3);
          mesh1.add(mesh2);
          scene.add(mesh1);
          scene.remove(mesh1);
          expect(spy).toHaveBeenCalledTimes(1);
          expect(spy).toHaveBeenCalledWith(mesh1);
          spy.mockRestore();
          done();
        });
      }));
  });
});

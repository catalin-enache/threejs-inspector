import * as THREE from 'three';
import { expect, describe, it, vi } from 'vitest';
import { withScene } from 'testutils/testScene';
import { offlineScene } from 'lib/App/CPanel/offlineScene';
import patchThree from 'lib/App/SetUp/patchThree';
import { useAppStore } from 'src/store';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';

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
            expect(mesh.__inspectorData.isInspectable).toBe(true);
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
            expect(child.__inspectorData.isInspectable).toBe(true);
            expect(grandchild.__inspectorData.isInspectable).toBe(true);
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
    it('when object is a main scene object it returns true, else false', () =>
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
          expect(mesh1.parent instanceof THREE.Scene).toBe(true);
          expect(mesh2.parent instanceof THREE.Scene).toBe(true);
          expect(isSceneObject(mesh1)).toBe(true);
          expect(isSceneObject(mesh2)).toBe(false);
          done();
        });
      }));
  });

  describe('isMainScene', () => {
    it('when object is a main scene object it returns true, else false', () =>
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
      // because cleanupAfterRemovedObject will traverse all children
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

    it('sets selected object to null', () =>
      new Promise<void>((done) => {
        withScene(
          0,
          true
        )(async ({ scene }) => {
          const mesh1 = new THREE.Mesh();
          scene.add(mesh1);
          useAppStore.getState().setSelectedObject(mesh1);
          expect(useAppStore.getState().getSelectedObject()).toBe(mesh1);
          scene.remove(mesh1);
          expect(useAppStore.getState().getSelectedObject()).toBe(null);
          done();
        });
      }));
  });

  describe('handleObjectAdded', () => {
    describe('when object is (PerspectiveCamera || OrthographicCamera)', () => {
      describe('when not object.__inspectorData.useOnPlay', () => {
        it('does not set cameraToUseOnPlay', () =>
          new Promise<void>((done) => {
            withScene(
              0,
              true
            )(async ({ scene }) => {
              const perspectiveCamera = new THREE.PerspectiveCamera();
              const orthographicCamera = new THREE.OrthographicCamera();
              scene.add(perspectiveCamera);
              scene.add(orthographicCamera);
              expect(patchThree.cameraToUseOnPlay).toBe(null);
              done();
            });
          }));
      });

      describe('when object.__inspectorData.useOnPlay === true', () => {
        it('sets cameraToUseOnPlay to object', () =>
          new Promise<void>((done) => {
            withScene(
              0,
              true
            )(async ({ scene }) => {
              const perspectiveCamera = new THREE.PerspectiveCamera();
              const orthographicCamera = new THREE.OrthographicCamera();
              orthographicCamera.__inspectorData.useOnPlay = true;
              perspectiveCamera.__inspectorData.useOnPlay = true;
              scene.add(perspectiveCamera);
              expect(patchThree.cameraToUseOnPlay).toBe(perspectiveCamera);
              scene.add(orthographicCamera);
              expect(patchThree.cameraToUseOnPlay).toBe(orthographicCamera);
              scene.remove(orthographicCamera);
              expect(patchThree.cameraToUseOnPlay).toBe(null);
              done();
            });
          }));
      });
    });

    describe('when object.__inspectorData.picker', () => {
      it('adds picker object to interactableObjects', () =>
        new Promise<void>((done) => {
          withScene(
            0,
            true
          )(async ({ scene }) => {
            const perspectiveCamera = new THREE.PerspectiveCamera();
            scene.add(perspectiveCamera);
            expect(perspectiveCamera.__inspectorData.picker!.__inspectorData.isPicker).toBe(true);
            expect(patchThree.interactableObjects[perspectiveCamera.__inspectorData.picker!.uuid]).toBe(
              perspectiveCamera.__inspectorData.picker
            );
            scene.remove(perspectiveCamera);
            expect(patchThree.interactableObjects[perspectiveCamera.__inspectorData.picker!.uuid]).toBe(undefined);
            done();
          });
        }));
    });

    describe('when object.__inspectorData.isInspectable', () => {
      it('adds object to interactableObjects', () =>
        new Promise<void>((done) => {
          withScene(
            0,
            true
          )(async ({ scene }) => {
            const mesh = new THREE.Mesh();
            mesh.__inspectorData.isInspectable = true;
            scene.add(mesh);
            expect(patchThree.interactableObjects[mesh.uuid]).toBe(mesh);
            scene.remove(mesh);
            expect(patchThree.interactableObjects[mesh.uuid]).toBe(undefined);
            done();
          });
        }));
    });

    describe('when not object.__inspectorData.isInspectable', () => {
      it('does not add object to interactableObjects', () =>
        new Promise<void>((done) => {
          withScene(
            0,
            true
          )(async ({ scene }) => {
            const mesh = new THREE.Mesh();
            scene.add(mesh);
            expect(patchThree.interactableObjects[mesh.uuid]).toBe(undefined);
            scene.remove(mesh);
            expect(patchThree.interactableObjects[mesh.uuid]).toBe(undefined);
            done();
          });
        }));
    });

    describe('when object.__inspectorData.helper', () => {
      it('adds helper to scene', () =>
        new Promise<void>((done) => {
          withScene(
            0,
            true
          )(async ({ scene }) => {
            const perspectiveCamera = new THREE.PerspectiveCamera();
            scene.add(perspectiveCamera);
            expect(perspectiveCamera.__inspectorData.helper).toBeTruthy();
            expect(scene.children).toContain(perspectiveCamera.__inspectorData.helper);
            scene.remove(perspectiveCamera);
            expect(scene.children).not.toContain(perspectiveCamera.__inspectorData.helper);
            done();
          });
        }));
    });
  });

  describe('cleanupAfterRemovedObject', () => {
    describe('when object has subscriptions', () => {
      it('clears subscriptions for the  object', () =>
        new Promise<void>((done) => {
          withScene(
            0,
            true
          )(async ({ scene }) => {
            const perspectiveCamera = new THREE.PerspectiveCamera();
            scene.add(perspectiveCamera);
            expect(patchThree.subscriptions[perspectiveCamera.uuid].length).toBe(3);
            scene.remove(perspectiveCamera);
            expect(patchThree.subscriptions[perspectiveCamera.uuid].length).toBe(0);
            done();
          });
        }));
    });

    describe('when object has dependant objects', () => {
      it('clears dependant objects', () =>
        new Promise<void>((done) => {
          withScene(
            0,
            true
          )(async ({ scene }) => {
            const perspectiveCamera = new THREE.PerspectiveCamera();
            scene.add(perspectiveCamera);
            expect(perspectiveCamera.__inspectorData.dependantObjects!.length).toBe(2);
            scene.remove(perspectiveCamera);
            expect(perspectiveCamera.__inspectorData.dependantObjects!.length).toBe(0);
            done();
          });
        }));
    });

    describe('when object.__inspectorData.helper', () => {
      it('removes helper from scene', () =>
        new Promise<void>((done) => {
          withScene(
            0,
            true
          )(async ({ scene }) => {
            const perspectiveCamera = new THREE.PerspectiveCamera();
            scene.add(perspectiveCamera);
            expect(scene.children).toContain(perspectiveCamera.__inspectorData.helper);
            scene.remove(perspectiveCamera);
            expect(scene.children).not.toContain(perspectiveCamera.__inspectorData.helper);
            done();
          });
        }));
    });

    describe('when object.__inspectorData.picker', () => {
      it('removes picker from interactableObjects and destroys it', () =>
        new Promise<void>((done) => {
          withScene(
            0,
            true
          )(async ({ scene }) => {
            const destroyOnRemove = useAppStore.getState().destroyOnRemove;
            useAppStore.getState().setDestroyOnRemove(true);
            const perspectiveCamera = new THREE.PerspectiveCamera();
            scene.add(perspectiveCamera);
            expect(patchThree.interactableObjects[perspectiveCamera.__inspectorData.picker!.uuid]).toBe(
              perspectiveCamera.__inspectorData.picker
            );
            const spyOnDestroy = vi.spyOn(patchThree, 'destroy');
            scene.remove(perspectiveCamera);
            expect(spyOnDestroy).toHaveBeenCalledTimes(3);
            expect(spyOnDestroy).toHaveBeenCalledWith(perspectiveCamera.__inspectorData.picker);
            expect(spyOnDestroy).toHaveBeenCalledWith(perspectiveCamera.__inspectorData.helper);
            expect(spyOnDestroy).toHaveBeenCalledWith(perspectiveCamera);
            expect(patchThree.interactableObjects[perspectiveCamera.__inspectorData.picker!.uuid]).toBe(undefined);
            spyOnDestroy.mockRestore();
            useAppStore.getState().setDestroyOnRemove(destroyOnRemove);
            done();
          });
        }));
    });

    describe('when useAppStore.getState().destroyOnRemove === false', () => {
      it('does not destroy the object', () =>
        new Promise<void>((done) => {
          withScene(
            0,
            true
          )(async ({ scene }) => {
            const destroyOnRemove = useAppStore.getState().destroyOnRemove;
            useAppStore.getState().setDestroyOnRemove(false);
            const spyOnDestroy = vi.spyOn(patchThree, 'destroy');

            const object = new THREE.Object3D();
            scene.add(object);
            scene.remove(object);

            expect(spyOnDestroy).not.toHaveBeenCalled();

            spyOnDestroy.mockRestore();
            useAppStore.getState().setDestroyOnRemove(destroyOnRemove);
            done();
          });
        }));
    });

    describe('when useAppStore.getState().destroyOnRemove === true', () => {
      it('destroys the object recursively', () =>
        new Promise<void>((done) => {
          withScene(
            0,
            true
          )(async ({ scene }) => {
            const destroyOnRemove = useAppStore.getState().destroyOnRemove;
            useAppStore.getState().setDestroyOnRemove(true);
            const spyOnDestroy = vi.spyOn(patchThree, 'destroy');

            const object = new THREE.Object3D();
            const child = new THREE.Object3D();
            const grandChild = new THREE.Object3D();
            object.add(child);
            child.add(grandChild);

            scene.add(object);
            scene.remove(object);

            expect(spyOnDestroy).toHaveBeenCalledTimes(3);
            expect(spyOnDestroy).toHaveBeenCalledWith(object);
            expect(spyOnDestroy).toHaveBeenCalledWith(child);
            expect(spyOnDestroy).toHaveBeenCalledWith(grandChild);

            spyOnDestroy.mockRestore();
            useAppStore.getState().setDestroyOnRemove(destroyOnRemove);
            done();
          });
        }));

      it('does NOT destroy helpers and pickers for cameraToUseOnPlay', () => {
        withScene(
          0,
          true
        )(async ({ scene }) => {
          const destroyOnRemove = useAppStore.getState().destroyOnRemove;
          useAppStore.getState().setDestroyOnRemove(true);
          const spyOnDestroy = vi.spyOn(patchThree, 'destroy');

          const perspectiveCamera = new THREE.PerspectiveCamera();
          perspectiveCamera.__inspectorData.useOnPlay = true;
          scene.add(perspectiveCamera);
          scene.remove(perspectiveCamera);

          expect(spyOnDestroy).toHaveBeenCalledTimes(1);
          expect(spyOnDestroy).toHaveBeenCalledWith(perspectiveCamera);
          // destroy has not been called for helper and picker

          spyOnDestroy.mockRestore();
          useAppStore.getState().setDestroyOnRemove(destroyOnRemove);
        });
      });
    });

    describe('when object is in interactableObjects', () => {
      it('removes object from interactableObjects', () =>
        new Promise<void>((done) => {
          withScene(
            0,
            true
          )(async ({ scene }) => {
            const mesh = new THREE.Mesh();
            scene.add(mesh);
            patchThree.interactableObjects[mesh.uuid] = mesh;
            expect(patchThree.interactableObjects[mesh.uuid]).toBe(mesh);
            scene.remove(mesh);
            expect(patchThree.interactableObjects[mesh.uuid]).toBe(undefined);
            done();
          });
        }));
    });

    describe('when object.__inspectorData.useOnPlay', () => {
      it('set patchTree.cameraToUseOnPlay to null', async () =>
        withScene(
          0,
          true
        )(async ({ scene }) => {
          const perspectiveCamera = new THREE.PerspectiveCamera();
          perspectiveCamera.__inspectorData.useOnPlay = true;
          scene.add(perspectiveCamera);
          expect(patchThree.cameraToUseOnPlay).toBe(perspectiveCamera);
          scene.remove(perspectiveCamera);
          expect.soft(patchThree.cameraToUseOnPlay).toBe(null);
        }));
    });

    describe('when transformControls are attached to object', () => {
      it('they are detached', async () =>
        withScene(
          0,
          true
        )(async ({ scene, canvas }) => {
          const mesh = new THREE.Mesh();
          const camera = new THREE.PerspectiveCamera();
          scene.add(mesh);
          const transformControls = new TransformControls(camera, canvas);
          transformControls.detach = vi.fn();
          scene.__inspectorData.transformControlsRef = { current: transformControls };
          transformControls.attach(mesh);
          scene.remove(mesh);
          try {
            expect(transformControls.detach).toHaveBeenCalled();
          } catch (e) {
            scene.__inspectorData.transformControlsRef = undefined;
            throw e;
          }
        }));
    });

    describe('when child.__inspectorData.dependantObjects', () => {
      it('dependantObjects are removed and destroyed', async () =>
        withScene(
          0,
          true
        )(async ({ scene }) => {
          const destroyOnRemove = useAppStore.getState().destroyOnRemove;
          useAppStore.getState().setDestroyOnRemove(false);
          const parent = new THREE.Object3D();
          const child = new THREE.Object3D();
          const spy = vi.spyOn(patchThree, 'destroy');
          parent.add(child);
          scene.add(parent);
          const dependantObject = new THREE.Object3D();
          child.__inspectorData.dependantObjects!.push(dependantObject);
          scene.remove(parent);
          useAppStore.getState().setDestroyOnRemove(destroyOnRemove);
          try {
            expect(child.__inspectorData.dependantObjects).toEqual([]);
            expect(spy).toHaveBeenCalledWith(dependantObject);
          } catch (e) {
            spy.mockRestore();
            throw e;
          }
        }));
    });
  });
});

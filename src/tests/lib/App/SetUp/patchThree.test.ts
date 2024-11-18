import * as THREE from 'three';
import { expect, describe, it, vi } from 'vitest';
import { withScene } from 'testutils/testScene';
import { roundArray } from 'testutils/roundArray';
import { offlineScene } from 'lib/App/CPanel/offlineScene';
import patchThree from 'lib/App/SetUp/patchThree';
import { useAppStore } from '../../../../store';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { LightProbeGenerator } from 'three/examples/jsm/lights/LightProbeGenerator';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

// vi.mock('../../../../store');

const { isMainScene, isSceneObject } = patchThree;

describe('patchThree', () => {
  describe('__inspectorData', () => {
    describe('isInspectable', () => {
      it('is settable', async () =>
        new Promise<void>((done) => {
          withScene()(async ({ scene: _ }) => {
            const mesh = new THREE.Mesh();
            mesh.__inspectorData.isInspectable = true;
            expect(mesh.__inspectorData.isInspectable).toBe(true);
            done();
          });
        }));

      it('is propagated to children', async () =>
        new Promise<void>((done) => {
          withScene()(async ({ scene: _ }) => {
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

      it('sets hitRedirect to parent if it was not set to something else', async () =>
        new Promise<void>((done) => {
          withScene()(async ({ scene: _ }) => {
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

      it('does not set hitRedirect if it was set to something else', async () =>
        new Promise<void>((done) => {
          withScene()(async ({ scene: _ }) => {
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
      it('is settable', async () =>
        new Promise<void>((done) => {
          withScene()(async ({ scene: _ }) => {
            const mesh = new THREE.Mesh();
            const hitRedirect = new THREE.Object3D();
            mesh.__inspectorData.hitRedirect = hitRedirect;
            expect(mesh.__inspectorData.hitRedirect).toBe(hitRedirect);
            done();
          });
        }));

      it('is propagated to children overriding prev value', async () =>
        new Promise<void>((done) => {
          withScene()(async ({ scene: _ }) => {
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
      it('is an array already provided', async () =>
        new Promise<void>((done) => {
          withScene()(async ({ scene: _ }) => {
            const mesh = new THREE.Mesh();
            const dependantObject = new THREE.Object3D();
            mesh.__inspectorData.dependantObjects!.push(dependantObject);
            expect(mesh.__inspectorData.dependantObjects).toContain(dependantObject);
            done();
          });
        }));

      it('is not settable', async () => {
        await withScene()(async ({ scene: _ }) => {
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
    it('when object is a main scene object it returns true, else false', async () =>
      new Promise<void>((done) => {
        withScene()(async ({ scene }) => {
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
    it('when object is a main scene object it returns true, else false', async () =>
      new Promise<void>((done) => {
        withScene()(async ({ scene }) => {
          expect(isMainScene(scene)).toBeTruthy();
          expect(isMainScene(offlineScene)).toBeFalsy();
          done();
        });
      }));
  });

  describe('Object3D.prototype.add', () => {
    it('does not call handleObjectAdded when not adding to the scene', async () =>
      new Promise<void>((done) => {
        withScene()(async ({ scene: _ }) => {
          const spy = vi.spyOn(patchThree, 'handleObjectAdded');
          const mesh1 = new THREE.Mesh();
          const mesh2 = new THREE.Mesh();
          mesh1.add(mesh2);
          expect(spy).not.toHaveBeenCalled();
          spy.mockRestore();
          done();
        });
      }));

    it('does not call handleObjectAdded when adding to the offlineScene', async () =>
      new Promise<void>((done) => {
        withScene()(async ({ scene: _ }) => {
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

    it('calls handleObjectAdded when adding to the scene', async () =>
      new Promise<void>((done) => {
        withScene()(async ({ scene }) => {
          const spy = vi.spyOn(patchThree, 'handleObjectAdded');
          const mesh1 = new THREE.Mesh();
          scene.add(mesh1);
          expect(spy).toHaveBeenCalledTimes(1);
          expect(spy).toHaveBeenCalledWith(mesh1);
          spy.mockRestore();
          done();
        });
      }));

    it('calls handleObjectAdded recursively when adding to the scene', async () =>
      new Promise<void>((done) => {
        withScene()(async ({ scene }) => {
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
    it('does not call cleanupAfterRemovedObject for children of THREE.CubeCamera', async () =>
      new Promise<void>((done) => {
        withScene()(async ({ scene: _ }) => {
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

    it('calls cleanupAfterRemovedObject even object is not added to the scene', async () =>
      new Promise<void>((done) => {
        withScene()(async ({ scene: _ }) => {
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

    it('calls cleanupAfterRemovedObject for the objects directly removed, not recursively through children', async () =>
      // because cleanupAfterRemovedObject will traverse all children
      new Promise<void>((done) => {
        withScene()(async ({ scene }) => {
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

    it('sets selected object to null', async () =>
      new Promise<void>((done) => {
        withScene()(async ({ scene }) => {
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
        it('does not set cameraToUseOnPlay', async () =>
          new Promise<void>((done) => {
            withScene()(async ({ scene }) => {
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
        it('sets cameraToUseOnPlay to object', async () =>
          new Promise<void>((done) => {
            withScene()(async ({ scene }) => {
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
      it('adds picker object to interactableObjects', async () =>
        new Promise<void>((done) => {
          withScene()(async ({ scene }) => {
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
      it('adds object to interactableObjects', async () =>
        new Promise<void>((done) => {
          withScene()(async ({ scene }) => {
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
      it('does not add object to interactableObjects', async () =>
        new Promise<void>((done) => {
          withScene()(async ({ scene }) => {
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
      it('adds helper to scene', async () =>
        new Promise<void>((done) => {
          withScene()(async ({ scene }) => {
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
      it('clears subscriptions for the  object', async () =>
        new Promise<void>((done) => {
          withScene()(async ({ scene }) => {
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
      it('clears dependant objects', async () =>
        new Promise<void>((done) => {
          withScene()(async ({ scene }) => {
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
      it('removes helper from scene', async () =>
        new Promise<void>((done) => {
          withScene()(async ({ scene }) => {
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
      it('removes picker from interactableObjects and destroys it', async () =>
        new Promise<void>((done) => {
          withScene()(async ({ scene }) => {
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
      it('does not destroy the object', async () =>
        new Promise<void>((done) => {
          withScene()(async ({ scene }) => {
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
      it('destroys the object recursively', async () =>
        new Promise<void>((done) => {
          withScene()(async ({ scene }) => {
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

      it('does NOT destroy helpers and pickers for cameraToUseOnPlay', async () => {
        await withScene()(async ({ scene }) => {
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
      it('removes object from interactableObjects', async () =>
        new Promise<void>((done) => {
          withScene()(async ({ scene }) => {
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
        await withScene()(async ({ scene }) => {
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
        await withScene()(async ({ scene, canvas }) => {
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
        await withScene()(async ({ scene }) => {
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

  describe('makeHelpers', () => {
    describe('when object is a Camera', () => {
      it('adds helper to dependantObjects which react to object changes', async () => {
        const originalGetState = useAppStore.getState.bind(useAppStore);
        vi.spyOn(useAppStore, 'getState').mockImplementation(() => {
          return {
            ...originalGetState(),
            gizmoSize: 50
          };
        });
        await withScene()(async ({ scene }) => {
          return new Promise((done) => {
            const perspectiveCamera = new THREE.PerspectiveCamera();
            perspectiveCamera.position.set(10, 15, 20);
            perspectiveCamera.lookAt(0, 100, 10);
            scene.add(perspectiveCamera);

            const helper = perspectiveCamera.__inspectorData.helper!;
            const picker = perspectiveCamera.__inspectorData.picker!;
            perspectiveCamera.updateMatrixWorld();
            useAppStore.getState().setSelectedObject(perspectiveCamera);
            useAppStore.getState().triggerSelectedObjectChanged();
            helper.updateWorldMatrix(true, false);

            expect(perspectiveCamera.__inspectorData.dependantObjects).toContain(helper);
            expect(perspectiveCamera.__inspectorData.dependantObjects).toContain(picker);

            expect(roundArray(picker.geometry.attributes.position.array)).toEqual([
              0, 0, 49.5, 0, 0, 49.5, 0, 0, 49.5, 0, 0, 49.5, 0, 0, 49.5, 0, 0, 49.5, 0, 0, 49.5, 0, 0, 49.5, 0, 0,
              49.5, 0, -100, -50.5, 70.7, -70.7, -50.5, 100, 0, -50.5, 70.7, 70.7, -50.5, 0, 100, -50.5, -70.7, 70.7,
              -50.5, -100, 0, -50.5, -70.7, -70.7, -50.5, 0, -100, -50.5, 0, 0, -50.5, 0, 0, -50.5, 0, 0, -50.5, 0, 0,
              -50.5, 0, 0, -50.5, 0, 0, -50.5, 0, 0, -50.5, 0, 0, -50.5, 0, -100, -50.5, 70.7, -70.7, -50.5, 100, 0,
              -50.5, 70.7, 70.7, -50.5, 0, 100, -50.5, -70.7, 70.7, -50.5, -100, 0, -50.5, -70.7, -70.7, -50.5, 0, -100,
              -50.5
            ]);

            expect(roundArray(helper.matrixWorld.elements)).toEqual([
              0.7, 0, -0.7, 0, 0.7, 0.2, 0.7, 0, 0.1, -1, 0.1, 0, 10, 15, 20, 1
            ]);
            expect(roundArray(picker.matrixWorld.elements)).toEqual([
              0.7, 0, -0.7, 0, 0.7, 0.2, 0.7, 0, 0.1, -1, 0.1, 0, 10, 15, 20, 1
            ]);

            perspectiveCamera.lookAt(0, 0, 0);
            perspectiveCamera.updateMatrixWorld();
            useAppStore.getState().setSelectedObject(perspectiveCamera);
            useAppStore.getState().triggerSelectedObjectChanged();
            helper.updateWorldMatrix(true, false);

            expect(roundArray(helper.matrixWorld.elements)).toEqual([
              0.9, 0, -0.4, 0, -0.2, 0.8, -0.5, 0, 0.4, 0.6, 0.7, 0, 10, 15, 20, 1
            ]);
            expect(roundArray(picker.matrixWorld.elements)).toEqual([
              0.9, 0, -0.4, 0, -0.2, 0.8, -0.5, 0, 0.4, 0.6, 0.7, 0, 10, 15, 20, 1
            ]);

            perspectiveCamera.position.set(0, 0, 0);
            perspectiveCamera.rotation.set(0, 0, 0);
            perspectiveCamera.updateMatrixWorld();
            useAppStore.getState().setSelectedObject(perspectiveCamera);
            useAppStore.getState().triggerSelectedObjectChanged();
            helper.updateWorldMatrix(true, false);

            expect(roundArray(helper.matrixWorld.elements)).toEqual([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
            expect(roundArray(picker.matrixWorld.elements)).toEqual([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

            done();
          });
        });
      });
    });

    describe('when object is a RectAreaLight', () => {
      it('adds helper and picker to dependantObjects which react to object changes', async () => {
        // testing width, height, position, color
        await withScene()(async ({ scene }) => {
          return new Promise((done) => {
            const rectAreaLight = new THREE.RectAreaLight();
            rectAreaLight.color = new THREE.Color(0xff0000);
            rectAreaLight.width = 6.6;
            rectAreaLight.height = 4.4;
            rectAreaLight.position.set(10, 15, 20);
            scene.add(rectAreaLight);

            const helper = rectAreaLight.__inspectorData.helper!;
            const picker = rectAreaLight.__inspectorData.picker!;
            rectAreaLight.updateMatrixWorld();
            helper.updateMatrixWorld();

            expect(rectAreaLight.__inspectorData.dependantObjects).toContain(helper);
            expect(rectAreaLight.__inspectorData.dependantObjects).toContain(picker);

            expect(((helper.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial).color.r).toBe(1);
            expect(((helper.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial).color.g).toBe(0);
            expect((picker.material as THREE.MeshBasicMaterial).color.r).toBe(1);
            expect((picker.material as THREE.MeshBasicMaterial).color.g).toBe(0);

            expect(helper.scale.x).toBe(3.3); // half of width
            expect(helper.scale.y).toBe(2.2); // half of height

            expect(helper.matrixWorld.elements).toEqual([3.3, 0, 0, 0, 0, 2.2, 0, 0, 0, 0, 1, 0, 10, 15, 20, 1]);
            const pickerGeometryPositions = Array.from(picker.geometry.attributes.position.array).map((v: number) => {
              return +v.toFixed(1);
            });
            expect(pickerGeometryPositions).toEqual([-3.3, 2.2, 0, 3.3, 2.2, 0, -3.3, -2.2, 0, 3.3, -2.2, 0]);

            rectAreaLight.position.set(0, 0, 0);
            rectAreaLight.width = 5;
            rectAreaLight.height = 5;
            rectAreaLight.color = new THREE.Color(0x00ff00);

            rectAreaLight.updateMatrixWorld();
            helper.updateMatrixWorld();

            expect(helper.scale.x).toBe(2.5); // half of width
            expect(helper.scale.y).toBe(2.5); // half of height

            useAppStore.getState().setSelectedObject(rectAreaLight);
            useAppStore.getState().triggerSelectedObjectChanged();

            expect(((helper.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial).color.r).toBe(0);
            expect(((helper.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial).color.g).toBe(1);
            expect((picker.material as THREE.MeshBasicMaterial).color.r).toBe(0);
            expect((picker.material as THREE.MeshBasicMaterial).color.g).toBe(1);

            const pickerGeometryPositions2 = Array.from(picker.geometry.attributes.position.array).map((v: number) => {
              return +v.toFixed(1);
            });
            expect(pickerGeometryPositions2).toEqual([-2.5, 2.5, 0, 2.5, 2.5, 0, -2.5, -2.5, 0, 2.5, -2.5, 0]);

            done();
          });
        });
      });
    });

    describe('when object is a DirectionalLight', () => {
      it('adds helper and picker to dependantObjects which react to object changes', async () => {
        const originalGetState = useAppStore.getState.bind(useAppStore);
        vi.spyOn(useAppStore, 'getState').mockImplementation(() => {
          return {
            ...originalGetState(),
            gizmoSize: 50
          };
        });

        await withScene()(async ({ scene }) => {
          return new Promise((done) => {
            const directionalLight = new THREE.DirectionalLight();
            directionalLight.color = new THREE.Color(0xff0000);
            directionalLight.intensity = 5;
            directionalLight.position.set(10, 15, 20);
            scene.add(directionalLight);

            const helper = directionalLight.__inspectorData.helper!;
            const picker = directionalLight.__inspectorData.picker!;
            directionalLight.updateMatrixWorld();
            useAppStore.getState().setSelectedObject(directionalLight);
            useAppStore.getState().triggerSelectedObjectChanged();
            (helper as THREE.DirectionalLightHelper).update();

            expect(roundArray((helper.children[0] as THREE.Line).geometry.attributes.position.array)).toEqual([
              -100, 100, 0, 100, 100, 0, 100, -100, 0, -100, -100, 0, -100, 100, 0
            ]);

            expect(directionalLight.__inspectorData.dependantObjects).toContain(helper);
            expect(directionalLight.__inspectorData.dependantObjects).toContain(picker);

            expect(((helper.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial).color.r).toBe(1);
            expect(((helper.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial).color.g).toBe(0);
            expect((picker.material as THREE.MeshBasicMaterial).color.r).toBe(1);
            expect((picker.material as THREE.MeshBasicMaterial).color.g).toBe(0);

            expect(picker.rotation.x.toFixed(1)).toBe('2.5');
            expect(picker.rotation.y.toFixed(1)).toBe('-0.4');
            expect(picker.rotation.z.toFixed(1)).toBe('2.9');

            expect(helper.children[0].rotation.x.toFixed(1)).toBe('2.5');
            expect(helper.children[0].rotation.y.toFixed(1)).toBe('-0.4');
            expect(helper.children[0].rotation.z.toFixed(1)).toBe('2.9');

            expect(roundArray(picker.matrix.elements)).toEqual([
              -0.9, 0, 0.4, 0, -0.2, 0.8, -0.5, 0, -0.4, -0.6, -0.7, 0, 0, 0, 0, 1
            ]);
            expect(roundArray(helper.children[0].matrixWorld.elements)).toEqual([
              -0.9, 0, 0.4, 0, -0.2, 0.8, -0.5, 0, -0.4, -0.6, -0.7, 0, 10, 15, 20, 1
            ]);

            directionalLight.color = new THREE.Color(0x00ff00);
            directionalLight.target.position.set(20, 20, 20);
            directionalLight.updateMatrixWorld();
            (helper as THREE.SpotLightHelper).update();
            useAppStore.getState().setSelectedObject(directionalLight);
            useAppStore.getState().triggerSelectedObjectChanged();

            expect(((helper.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial).color.r).toBe(0);
            expect(((helper.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial).color.g).toBe(1);
            expect((picker.material as THREE.MeshBasicMaterial).color.r).toBe(0);
            expect((picker.material as THREE.MeshBasicMaterial).color.g).toBe(1);

            expect(picker.rotation.x.toFixed(1)).toBe('-1.6');
            expect(picker.rotation.y.toFixed(1)).toBe('1.1');
            expect(picker.rotation.z.toFixed(1)).toBe('1.6');

            expect(helper.children[0].rotation.x.toFixed(1)).toBe('-1.6');
            expect(helper.children[0].rotation.y.toFixed(1)).toBe('1.1');
            expect(helper.children[0].rotation.z.toFixed(1)).toBe('1.6');

            expect(roundArray(picker.matrix.elements)).toEqual([
              0, 0, -1, 0, -0.4, 0.9, 0, 0, 0.9, 0.4, 0, 0, 0, 0, 0, 1
            ]);
            expect(roundArray(helper.children[0].matrixWorld.elements)).toEqual([
              0, 0, -1, 0, -0.4, 0.9, 0, 0, 0.9, 0.4, 0, 0, 10, 15, 20, 1
            ]);

            directionalLight.position.set(0, 0, 0);
            directionalLight.updateMatrixWorld();
            (helper as THREE.SpotLightHelper).update();
            useAppStore.getState().setSelectedObject(directionalLight);
            useAppStore.getState().triggerSelectedObjectChanged();

            expect(picker.rotation.x.toFixed(1)).toBe('-0.8');
            expect(picker.rotation.y.toFixed(1)).toBe('0.6');
            expect(picker.rotation.z.toFixed(1)).toBe('0.5');

            expect(helper.children[0].rotation.x.toFixed(1)).toBe('-0.8');
            expect(helper.children[0].rotation.y.toFixed(1)).toBe('0.6');
            expect(helper.children[0].rotation.z.toFixed(1)).toBe('0.5');

            expect(roundArray(picker.matrix.elements)).toEqual([
              0.7, 0, -0.7, 0, -0.4, 0.8, -0.4, 0, 0.6, 0.6, 0.6, 0, 0, 0, 0, 1
            ]);
            expect(roundArray(helper.children[0].matrixWorld.elements)).toEqual([
              0.7, 0, -0.7, 0, -0.4, 0.8, -0.4, 0, 0.6, 0.6, 0.6, 0, 0, 0, 0, 1
            ]);

            done();
          });
        });
      });
    });

    describe('when object is a SpotLight', () => {
      it('adds helper and picker to dependantObjects which react to object changes', async () => {
        // vi.mock('../../../../store', async (importOriginal) => {
        //   const mod = (await importOriginal()) as typeof import('../../../../store');
        //   return {
        //     ...mod,
        //     useAppStore: {
        //       ...mod.useAppStore,
        //       getState: () => {
        //         return {
        //           ...mod.useAppStore.getState(),
        //           gizmoSize: 50
        //         };
        //       }
        //     }
        //   };
        // });

        const originalGetState = useAppStore.getState.bind(useAppStore);
        vi.spyOn(useAppStore, 'getState').mockImplementation(() => {
          return {
            ...originalGetState(),
            gizmoSize: 50
          };
        });

        await withScene()(async ({ scene }) => {
          return new Promise((done) => {
            const spotLight = new THREE.SpotLight();
            spotLight.color = new THREE.Color(0xff0000);
            spotLight.intensity = 5;
            spotLight.distance = 10;
            spotLight.angle = Math.PI / 4;
            spotLight.penumbra = 0.5;
            spotLight.decay = 2;
            spotLight.position.set(10, 15, 20);
            spotLight.target.position.set(0, 0, 0);
            scene.add(spotLight);

            const helper = spotLight.__inspectorData.helper!;
            const picker = spotLight.__inspectorData.picker!;
            spotLight.updateMatrixWorld();
            (helper as THREE.SpotLightHelper).update();
            picker.updateMatrixWorld();

            expect(spotLight.__inspectorData.dependantObjects).toContain(helper);
            expect(spotLight.__inspectorData.dependantObjects).toContain(picker);

            expect(((helper.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial).color.r).toBe(1);
            expect(((helper.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial).color.g).toBe(0);
            expect((picker.material as THREE.MeshBasicMaterial).color.r).toBe(1);
            expect((picker.material as THREE.MeshBasicMaterial).color.g).toBe(0);

            const expectedRoundedGeometryAttributesPosition = [
              0, 0, -49.5, 0, 0, -49.5, 0, 0, -49.5, 0, 0, -49.5, 0, 0, -49.5, 0, 100, 50.5, 100, 0, 50.5, 0, -100,
              50.5, -100, 0, 50.5, 0, 100, 50.5, 0, 0, 50.5, 0, 0, 50.5, 0, 0, 50.5, 0, 0, 50.5, 0, 100, 50.5, 100, 0,
              50.5, 0, -100, 50.5, -100, 0, 50.5, 0, 100, 50.5
            ];

            expect(roundArray(picker.geometry.attributes.position.array, 1)).toEqual(
              expectedRoundedGeometryAttributesPosition
            );

            expect(picker.rotation.x.toFixed(1)).toBe('2.5');
            expect(picker.rotation.y.toFixed(1)).toBe('-0.4');
            expect(picker.rotation.z.toFixed(1)).toBe('2.9');

            expect(helper.children[0].rotation.x.toFixed(1)).toBe('2.5');
            expect(helper.children[0].rotation.y.toFixed(1)).toBe('-0.4');
            expect(helper.children[0].rotation.z.toFixed(1)).toBe('2.9');

            expect(helper.children[0].scale.x.toFixed(1)).toBe('10.0'); // distance
            expect(helper.children[0].scale.y.toFixed(1)).toBe('10.0'); // distance
            expect(helper.children[0].scale.z.toFixed(1)).toBe('10.0'); // distance

            expect(roundArray(helper.children[0].matrixWorld.elements, 1)).toEqual([
              -8.9, 0, 4.5, 0, -2.5, 8.3, -5, 0, -3.7, -5.6, -7.4, 0, 10, 15, 20, 1
            ]);

            expect(roundArray(picker.matrixWorld.elements, 1)).toEqual([
              -0.9, 0, 0.4, 0, -0.2, 0.8, -0.5, 0, -0.4, -0.6, -0.7, 0, 10, 15, 20, 1
            ]);

            spotLight.color = new THREE.Color(0x00ff00);
            spotLight.target.position.set(20, 20, 20);
            spotLight.updateMatrixWorld();
            (helper as THREE.SpotLightHelper).update();
            useAppStore.getState().setSelectedObject(spotLight);
            useAppStore.getState().triggerSelectedObjectChanged();

            expect(((helper.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial).color.r).toBe(0);
            expect(((helper.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial).color.g).toBe(1);
            expect((picker.material as THREE.MeshBasicMaterial).color.r).toBe(0);
            expect((picker.material as THREE.MeshBasicMaterial).color.g).toBe(1);

            expect(picker.rotation.x.toFixed(1)).toBe('-1.6');
            expect(picker.rotation.y.toFixed(1)).toBe('1.1');
            expect(picker.rotation.z.toFixed(1)).toBe('1.6');

            expect(helper.children[0].rotation.x.toFixed(1)).toBe('-1.6');
            expect(helper.children[0].rotation.y.toFixed(1)).toBe('1.1');
            expect(helper.children[0].rotation.z.toFixed(1)).toBe('1.6');

            expect(roundArray(picker.geometry.attributes.position.array, 1)).toEqual(
              expectedRoundedGeometryAttributesPosition
            ); // not changed

            expect(roundArray(helper.children[0].matrixWorld.elements, 1)).toEqual([
              0, 0, -10, 0, -4.5, 8.9, 0, 0, 8.9, 4.5, 0, 0, 10, 15, 20, 1
            ]); // changed

            expect(roundArray(picker.matrixWorld.elements, 1)).toEqual([
              -0.9, 0, 0.4, 0, -0.2, 0.8, -0.5, 0, -0.4, -0.6, -0.7, 0, 10, 15, 20, 1
            ]); // changed

            spotLight.position.set(0, 0, 0);
            spotLight.updateMatrixWorld();
            (helper as THREE.SpotLightHelper).update();
            useAppStore.getState().setSelectedObject(spotLight);
            useAppStore.getState().triggerSelectedObjectChanged();

            expect(picker.rotation.x.toFixed(1)).toBe('-0.8');
            expect(picker.rotation.y.toFixed(1)).toBe('0.6');
            expect(picker.rotation.z.toFixed(1)).toBe('0.5');

            expect(helper.children[0].rotation.x.toFixed(1)).toBe('-0.8');
            expect(helper.children[0].rotation.y.toFixed(1)).toBe('0.6');
            expect(helper.children[0].rotation.z.toFixed(1)).toBe('0.5');

            expect(roundArray(picker.geometry.attributes.position.array, 1)).toEqual(
              expectedRoundedGeometryAttributesPosition
            ); // not changed

            expect(roundArray(helper.children[0].matrixWorld.elements, 1)).toEqual([
              7.1, 0, -7.1, 0, -4.1, 8.2, -4.1, 0, 5.8, 5.8, 5.8, 0, 0, 0, 0, 1
            ]); // changed

            expect(roundArray(picker.matrixWorld.elements, 1)).toEqual([
              0, 0, -1, 0, -0.4, 0.9, 0, 0, 0.9, 0.4, 0, 0, 0, 0, 0, 1
            ]); // changed

            done();
          });
        });
      });
    });

    describe('when object is a HemisphereLight', () => {
      it('adds helper and picker to dependantObjects which react to object changes', async () => {
        const originalGetState = useAppStore.getState.bind(useAppStore);
        vi.spyOn(useAppStore, 'getState').mockImplementation(() => {
          return {
            ...originalGetState(),
            gizmoSize: 50
          };
        });

        await withScene()(async ({ scene }) => {
          return new Promise((done) => {
            const hemisphereLight = new THREE.HemisphereLight();
            hemisphereLight.color = new THREE.Color(0xff0000);
            hemisphereLight.groundColor = new THREE.Color(0x00ff00);
            hemisphereLight.intensity = 5;
            hemisphereLight.position.set(10, 15, 20);
            scene.add(hemisphereLight);

            const helper = hemisphereLight.__inspectorData.helper!;
            const picker = hemisphereLight.__inspectorData.picker!;

            hemisphereLight.updateMatrixWorld();
            useAppStore.getState().setSelectedObject(hemisphereLight);
            useAppStore.getState().triggerSelectedObjectChanged();
            (helper as THREE.HemisphereLightHelper).update();

            expect(hemisphereLight.__inspectorData.dependantObjects).toContain(helper);
            expect(hemisphereLight.__inspectorData.dependantObjects).toContain(picker);

            expect((picker.material as THREE.MeshBasicMaterial).color.r).toBe(1);
            expect((picker.material as THREE.MeshBasicMaterial).color.g).toBe(0);

            expect(roundArray(picker.geometry.attributes.position.array)).toEqual([
              25, 25, 25, 25, 25, -25, 25, -25, 25, 25, -25, -25, -25, 25, -25, -25, 25, 25, -25, -25, -25, -25, -25,
              25, -25, 25, -25, 25, 25, -25, -25, 25, 25, 25, 25, 25, -25, -25, 25, 25, -25, 25, -25, -25, -25, 25, -25,
              -25, -25, 25, 25, 25, 25, 25, -25, -25, 25, 25, -25, 25, 25, 25, -25, -25, 25, -25, 25, -25, -25, -25,
              -25, -25
            ]);

            expect(roundArray(picker.matrixWorld.elements)).toEqual([
              1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 10, 15, 20, 1
            ]);

            hemisphereLight.color = new THREE.Color(0x00ff00);
            hemisphereLight.groundColor = new THREE.Color(0xff0000);
            hemisphereLight.position.set(0, 0, 0);
            hemisphereLight.updateMatrixWorld();
            useAppStore.getState().setSelectedObject(hemisphereLight);
            useAppStore.getState().triggerSelectedObjectChanged();
            (helper as THREE.HemisphereLightHelper).update();

            expect((picker.material as THREE.MeshBasicMaterial).color.r).toBe(0);
            expect((picker.material as THREE.MeshBasicMaterial).color.g).toBe(1);

            expect(roundArray(picker.matrixWorld.elements)).toEqual([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

            done();
          });
        });
      });
    });

    describe('when object is a LightProbe', () => {
      it('adds helper and picker to dependantObjects which react to object changes', { timeout: 5000 }, async () => {
        const originalGetState = useAppStore.getState.bind(useAppStore);
        vi.spyOn(useAppStore, 'getState').mockImplementation(() => {
          return {
            ...originalGetState(),
            gizmoSize: 2
          };
        });

        await withScene()(async ({ scene, dirLight, hemiLight, renderer }) => {
          return new Promise((done) => {
            // linear color space
            const API = {
              lightProbeIntensity: 1,
              directionalLightIntensity: 0.6,
              envMapIntensity: 1
            };

            const directionalLight = new THREE.DirectionalLight(0xffffff, API.directionalLightIntensity);
            directionalLight.position.set(10, 10, 10);
            scene.add(directionalLight);

            const lightProbe = new THREE.LightProbe();
            lightProbe.position.set(10, 15, 20);
            scene.add(lightProbe);

            const helper = lightProbe.__inspectorData.helper!;
            const picker = lightProbe.__inspectorData.picker!;
            lightProbe.updateMatrixWorld();
            lightProbe.updateWorldMatrix(true, false);
            useAppStore.getState().setSelectedObject(lightProbe);
            useAppStore.getState().triggerSelectedObjectChanged();
            helper.updateWorldMatrix(true, false);

            expect(lightProbe.__inspectorData.dependantObjects).toContain(helper);
            expect(lightProbe.__inspectorData.dependantObjects).toContain(picker);

            expect(roundArray(picker.matrixWorld.elements)).toEqual([
              1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 10, 15, 20, 1
            ]);
            expect(roundArray(helper.matrixWorld.elements)).toEqual([
              2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 10, 15, 20, 1
            ]);

            // envmap
            const genCubeUrls = function (prefix: string, postfix: string) {
              return [
                prefix + 'px' + postfix,
                prefix + 'nx' + postfix,
                prefix + 'py' + postfix,
                prefix + 'ny' + postfix,
                prefix + 'pz' + postfix,
                prefix + 'nz' + postfix
              ];
            };

            const urls = genCubeUrls('/textures/background/cube/pisa/', '.png');

            new THREE.CubeTextureLoader().load(urls, (cubeTexture) => {
              // const currentSceneBg = scene.background;
              // const currentSceneEnv = scene.environment;
              // const rendererToneMapping = renderer.toneMapping;
              dirLight.visible = false;
              hemiLight.visible = false;

              // cubeTexture.mapping = THREE.CubeRefractionMapping; // THREE.EquirectangularRefractionMapping / THREE.CubeReflectionMapping
              scene.background = cubeTexture;
              // scene.environment = cubeTexture;
              renderer.toneMapping = THREE.NoToneMapping;

              lightProbe.copy(LightProbeGenerator.fromCubeTexture(cubeTexture));
              lightProbe.position.set(-10, 0, 0);
              lightProbe.updateMatrixWorld();
              lightProbe.updateWorldMatrix(true, false);
              lightProbe.intensity = API.lightProbeIntensity;
              useAppStore.getState().setSelectedObject(lightProbe);
              useAppStore.getState().triggerSelectedObjectChanged();
              helper.updateWorldMatrix(true, false);
              picker.updateWorldMatrix(true, false);
              picker.updateMatrixWorld();

              expect(roundArray(picker.matrixWorld.elements)).toEqual([
                1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -10, 0, 0, 1
              ]);

              expect(roundArray(helper.matrixWorld.elements)).toEqual([
                2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, -10, 0, 0, 1
              ]);

              // const geometry = new THREE.SphereGeometry(5, 64, 32);
              const geometry = new THREE.TorusKnotGeometry(4, 1.5, 256, 32, 2, 3);

              const material = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                metalness: 0,
                roughness: 0,
                envMap: cubeTexture,
                envMapIntensity: API.envMapIntensity
              });

              const mesh = new THREE.Mesh(geometry, material);
              scene.add(mesh);

              // revert changes
              // scene.background = currentSceneBg;
              // scene.environment = currentSceneEnv;
              // renderer.toneMapping = rendererToneMapping;
              // dirLight.visible = true;
              // hemiLight.visible = true;
              done();
            });
          });
        });
      });
    });

    describe('when object is a PointLight', () => {
      it('adds helper and picker to dependantObjects which react to object changes', async () => {
        const originalGetState = useAppStore.getState.bind(useAppStore);
        vi.spyOn(useAppStore, 'getState').mockImplementation(() => {
          return {
            ...originalGetState(),
            gizmoSize: 50
          };
        });

        await withScene()(async ({ scene }) => {
          return new Promise((done) => {
            const pointLight = new THREE.PointLight();
            pointLight.color = new THREE.Color(0xff0000);
            pointLight.intensity = 5;
            pointLight.distance = 10;
            pointLight.position.set(10, 15, 20);
            scene.add(pointLight);

            const helper = pointLight.__inspectorData.helper!;
            const picker = pointLight.__inspectorData.picker!;

            pointLight.updateMatrixWorld();
            useAppStore.getState().setSelectedObject(pointLight);
            useAppStore.getState().triggerSelectedObjectChanged();
            (helper as THREE.PointLightHelper).update();
            helper.updateWorldMatrix(true, false);

            expect(pointLight.__inspectorData.dependantObjects).toContain(helper);
            expect(pointLight.__inspectorData.dependantObjects).toContain(picker);

            expect(((helper as THREE.Mesh).material as THREE.MeshBasicMaterial).color.r).toBe(1);
            expect(((helper as THREE.Mesh).material as THREE.MeshBasicMaterial).color.g).toBe(0);
            expect((picker.material as THREE.MeshBasicMaterial).color.r).toBe(1);
            expect((picker.material as THREE.MeshBasicMaterial).color.g).toBe(0);

            expect(roundArray((helper as THREE.Mesh).geometry.attributes.position.array)).toEqual([
              0, 50, 0, 0, 50, 0, 0, 50, 0, 0, 50, 0, 0, 50, 0, -50, 0, 0, 0, 0, 50, 50, 0, 0, 0, 0, -50, -50, 0, 0, 0,
              -50, 0, 0, -50, 0, 0, -50, 0, 0, -50, 0, 0, -50, 0
            ]);
            expect(roundArray(picker.geometry.attributes.position.array)).toEqual([
              0, 50, 0, 0, 50, 0, 0, 50, 0, 0, 50, 0, 0, 50, 0, -50, 0, 0, 0, 0, 50, 50, 0, 0, 0, 0, -50, -50, 0, 0, 0,
              -50, 0, 0, -50, 0, 0, -50, 0, 0, -50, 0, 0, -50, 0
            ]);
            expect(roundArray(helper.matrixWorld.elements)).toEqual([
              1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 10, 15, 20, 1
            ]);
            expect(roundArray(picker.matrixWorld.elements)).toEqual([
              1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 10, 15, 20, 1
            ]);

            pointLight.color = new THREE.Color(0x00ff00);
            pointLight.position.set(0, 0, 0);
            pointLight.updateMatrixWorld();
            (helper as THREE.PointLightHelper).update();
            useAppStore.getState().setSelectedObject(pointLight);
            useAppStore.getState().triggerSelectedObjectChanged();
            helper.updateWorldMatrix(true, false);

            expect(((helper as THREE.Mesh).material as THREE.MeshBasicMaterial).color.r).toBe(0);
            expect(((helper as THREE.Mesh).material as THREE.MeshBasicMaterial).color.g).toBe(1);
            expect((picker.material as THREE.MeshBasicMaterial).color.r).toBe(0);
            expect((picker.material as THREE.MeshBasicMaterial).color.g).toBe(1);

            expect(roundArray(helper.matrixWorld.elements)).toEqual([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
            expect(roundArray(picker.matrixWorld.elements)).toEqual([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

            done();
          });
        });
      });
    });

    describe('when object is a CubeCamera', () => {
      it('adds helper and picker to dependantObjects which react to object changes', { timeout: 10000 }, async () => {
        const originalGetState = useAppStore.getState.bind(useAppStore);
        vi.spyOn(useAppStore, 'getState').mockImplementation(() => {
          return {
            ...originalGetState(),
            gizmoSize: 50
          };
        });
        await withScene()(async ({ scene, renderer }) => {
          return new Promise((done) => {
            const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256);
            cubeRenderTarget.texture.type = THREE.HalfFloatType;

            const cubeCamera = new THREE.CubeCamera(1, 1000, cubeRenderTarget);

            cubeCamera.position.set(10, 15, 20);
            scene.add(cubeCamera);

            const helper = cubeCamera.__inspectorData.helper!;
            const picker = cubeCamera.__inspectorData.picker!;
            cubeCamera.updateMatrixWorld();

            new RGBELoader()
              .setPath('/textures/background/equirectangular/')
              .load('quarry_01_1k.hdr', function (texture) {
                texture.mapping = THREE.EquirectangularReflectionMapping;

                scene.background = texture;
                scene.environment = texture;
                // https://discourse.threejs.org/t/gl-invalid-operation-feedback-loop-formed-between-framebuffer-and-active-texture/66411
                // https://stackoverflow.com/questions/69710407/three-js-error-feedback-loop-formed-between-framebuffer-and-active-texture
                helper.visible = false;
                cubeCamera.update(renderer, scene);
                helper.visible = true;
              });

            expect(cubeCamera.__inspectorData.dependantObjects).toContain(helper);
            expect(cubeCamera.__inspectorData.dependantObjects).toContain(picker);

            expect(roundArray(helper.matrixWorld.elements)).toEqual([
              1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 10, 15, 20, 1
            ]);
            expect(roundArray(picker.matrixWorld.elements)).toEqual([
              1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 10, 15, 20, 1
            ]);

            cubeCamera.position.set(0, 0, 0);
            cubeCamera.updateMatrixWorld();

            expect(roundArray(helper.matrixWorld.elements)).toEqual([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
            expect(roundArray(picker.matrixWorld.elements)).toEqual([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

            done();
          });
        });
      });
    });

    describe('when object is a PositionalAudio', () => {
      it.only('adds helper and picker to dependantObjects which react to object changes', async () => {
        const originalGetState = useAppStore.getState.bind(useAppStore);
        vi.spyOn(useAppStore, 'getState').mockImplementation(() => {
          return {
            ...originalGetState(),
            gizmoSize: 50
          };
        });

        await withScene()(async ({ scene }) => {
          return new Promise((done) => {
            const audioListener = new THREE.AudioListener();
            const positionalAudio = new THREE.PositionalAudio(audioListener);
            const audioLoader = new THREE.AudioLoader();
            audioLoader.load('/sounds/ping_pong.mp3', (buffer) => {
              positionalAudio.setBuffer(buffer);
              positionalAudio.setRefDistance(20);
              positionalAudio.setRolloffFactor(1);
              // positionalAudio.setLoop(true);
              // positionalAudio.play();
            });

            positionalAudio.position.set(10, 15, 20);
            scene.add(positionalAudio);

            const helper = positionalAudio.__inspectorData.helper!;
            const picker = positionalAudio.__inspectorData.picker!;
            positionalAudio.updateMatrixWorld();

            expect(positionalAudio.__inspectorData.dependantObjects).toContain(helper);
            expect(positionalAudio.__inspectorData.dependantObjects).toContain(picker);

            expect(roundArray(helper.matrixWorld.elements)).toEqual([
              1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 10, 15, 20, 1
            ]);
            expect(roundArray(picker.matrixWorld.elements)).toEqual([
              1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 10, 15, 20, 1
            ]);
            done();
          });
        });
      });
    });
  });
});

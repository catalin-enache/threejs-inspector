import * as THREE from 'three';
import { expect, describe, it, vi } from 'vitest';
import { withScene } from 'testutils/testScene';
import { roundArray } from 'testutils/roundArray';
import { offlineScene } from 'lib/App/CPanel/offlineScene';
import patchThree from 'lib/App/SetUp/patchThree';
import { useAppStore } from '../../../../store';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';

// vi.mock('../../../../store');

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

  describe('makeHelpers', () => {
    describe('when object is a RectAreaLight', () => {
      it('adds helper and picker to dependantObjects which react to object changes', () => {
        // testing width, height, position, color
        withScene(
          0,
          true
        )(async ({ scene }) => {
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

    describe('when object is a SpotLight', () => {
      it('adds helper and picker to dependantObjects which react to object changes', () => {
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

        withScene(
          0,
          true
        )(async ({ scene }) => {
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

    describe('when object is a DirectionalLight', () => {
      it('adds helper and picker to dependantObjects which react to object changes', () => {
        withScene(
          0,
          true
        )(async ({ scene }) => {
          return new Promise((done) => {
            // TODO: continue here
            // const state = useAppStore.getState();
            // const helperSize = state.gizmoSize;
            // console.log('when object is a DirectionalLight', { helperSize });
            done();
          });
        });
      });
    });
  });
});

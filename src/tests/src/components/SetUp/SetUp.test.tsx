import * as THREE from 'three';
import { expect, describe, it, vi, beforeEach, afterEach, MockInstance } from 'vitest';
import { render } from 'vitest-browser-react';
import { waitFor } from '@testing-library/dom';
import { TestInjectedInspectorApp, TestDefaultApp, initDOM, clearDOM } from 'testutils/testApp';
import { defaultScene, defaultPerspectiveCamera, defaultOrthographicCamera } from 'lib/patchThree';
import { SETUP_EFFECT, SetUpProps } from 'components/SetUp/SetUp';
import { useAppStore } from 'src/store';
import patchThree from 'lib/patchThree';

import { loadObject } from 'lib/utils/loadObject';
import { DirectionalLightPicker, SpotLightPicker } from 'lib/followers';

const degToRad = THREE.MathUtils.degToRad;

describe('SetUp', () => {
  beforeEach(() => {
    initDOM();
  });

  afterEach(() => {
    defaultScene.clear();
    clearDOM();
    useAppStore.getState().reset();
  });

  describe('shouldUseCameraControls', () => {
    it(
      'is true when autoNavControls and not isPlaying or isPlaying and attachDefaultControllersToPlayingCamera is true',
      { timeout: 1000 },
      async () => {
        return new Promise<void>((done) => {
          const handleThreeChange: SetUpProps['onThreeChange'] = async (changed, three) => {
            const { camera } = three;
            if (changed === 'camera' && camera.name === 'DefaultPerspectiveCamera') {
              await waitFor(() => expect(patchThree.shouldUseCameraControls(camera)).toBe(true));
              useAppStore.getState().setPlayingState('playing'); // will change camera to myPerspectiveCamera because is useOnPlay
            }
            if (changed === 'camera' && camera.name === 'myPerspectiveCamera') {
              await waitFor(() => expect(patchThree.shouldUseCameraControls(camera)).toBe(false)); // because not attaching controls to playing camera
              useAppStore.getState().setAttachDefaultControllersToPlayingCamera(true);
              await waitFor(() => expect(patchThree.shouldUseCameraControls(camera)).toBe(true));
              res.unmount();
            }
          };

          useAppStore.getState().setAttachDefaultControllersToPlayingCamera(false);
          const res = render(
            <TestDefaultApp onThreeChange={handleThreeChange} onCPanelUnmounted={done}>
              <perspectiveCamera
                args={[75, 1, 0.1, 100]} // window.innerWidth / window.innerHeight
                position={[-12.98, 3.963, 4.346]}
                name="myPerspectiveCamera"
                rotation={[degToRad(-42.342), degToRad(-65.604), degToRad(-39.706)]} // 25.86 , -46.13, 19.26
                __inspectorData={{ useOnPlay: true }}
              />
            </TestDefaultApp>,
            {
              container: document.getElementById('main')!
            }
          );
        });
      }
    );
  });

  describe('onSceneDblClick', () => {
    it('set/unset selected object', { timeout: 7000 }, async () => {
      return new Promise<void>((done) => {
        const sceneReady = { current: false };
        const handleThreeChange: SetUpProps['onThreeChange'] = async (changed, three) => {
          if (sceneReady.current) return;
          if (changed === 'scene') {
            sceneReady.current = true;
            const { scene, camera, gl } = three;
            camera.position.z = 300;
            camera.updateMatrixWorld();
            loadObject('/models/MyTests/test_multi_features/test_multi_features.fbx', {
              scene,
              camera
            }).then((fbx) => {
              if (!fbx) return;
              fbx.name = 'fbx';
              fbx.__inspectorData.isInspectable = true;
              scene.add(fbx);

              setTimeout(async () => {
                // it seems we need to dispatch twice to get the correct three.pointer
                // dblclick on one of the object children position
                gl.domElement.dispatchEvent(
                  new MouseEvent('click', {
                    bubbles: true,
                    clientX: 400,
                    clientY: 267,
                    shiftKey: false
                  })
                );
                gl.domElement.dispatchEvent(
                  new MouseEvent('dblclick', {
                    bubbles: true,
                    clientX: 400,
                    clientY: 267,
                    shiftKey: false // selects root object
                  })
                );
                // three.pointer.x = -0.1;
                // three.pointer.y = 0.35;
                let selectedObject = useAppStore.getState().getSelectedObject()!;
                expect(selectedObject).toBe(fbx);
                expect(selectedObject.name).toBe('fbx');

                // useAppStore.getState().setSelectedObject(null);
                // or click outside the object
                gl.domElement.dispatchEvent(
                  new MouseEvent('click', {
                    bubbles: true,
                    clientX: 0,
                    clientY: 0,
                    shiftKey: false
                  })
                );
                gl.domElement.dispatchEvent(
                  new MouseEvent('dblclick', {
                    bubbles: true,
                    clientX: 0,
                    clientY: 0,
                    shiftKey: false
                  })
                );
                // proving unselecting the object after clicking outside and transform controls were detached
                await waitFor(() => expect(useAppStore.getState().getSelectedObject()).toBe(null), { timeout: 1000 });

                // dblclick on one of the object children position
                gl.domElement.dispatchEvent(
                  new MouseEvent('click', {
                    bubbles: true,
                    clientX: 364,
                    clientY: 200,
                    shiftKey: true // selects inside object when not isPicker
                  })
                );
                gl.domElement.dispatchEvent(
                  new MouseEvent('dblclick', {
                    bubbles: true,
                    clientX: 364,
                    clientY: 200,
                    shiftKey: true // selects inside object when not isPicker
                  })
                );

                selectedObject = useAppStore.getState().getSelectedObject()!;
                // proving that selecting inside occurred
                expect(selectedObject.parent).toBe(fbx);
                expect(selectedObject.name).toBe('Armor_2');

                // make the child be a picker
                selectedObject.__inspectorData.isPicker = true;
                useAppStore.getState().setSelectedObject(null); // or dblclick outside the object (tested before)
                await waitFor(() => expect(useAppStore.getState().getSelectedObject()).toBe(null), { timeout: 1000 });
                gl.domElement.dispatchEvent(
                  new MouseEvent('dblclick', {
                    bubbles: true,
                    clientX: 364,
                    clientY: 200,
                    shiftKey: true // ignored when isPicker
                  })
                );

                selectedObject = useAppStore.getState().getSelectedObject()!;
                // proving that even when trying to select inside if the child is a picker it will select the parent
                expect(selectedObject).toBe(fbx);
                expect(selectedObject.name).toBe('fbx');
                res.unmount();
              }, 0);
            });
          }
        };

        const res = render(
          <TestInjectedInspectorApp
            useDefaultPerspectiveCamera={true}
            useDefaultScene={true}
            onThreeChange={handleThreeChange}
            onCPanelUnmounted={done}
          ></TestInjectedInspectorApp>,
          {
            container: document.getElementById('main')!
          }
        );
      });
    });
  });

  describe('camera change', () => {
    it('updates TransformControls with camera when camera is changed', { timeout: 7000 }, async () => {
      return new Promise<void>((done) => {
        const handleSetupEffect: SetUpProps['onSetupEffect'] = async (effect) => {
          if (effect === SETUP_EFFECT.SETUP_INITIATED) {
            const cube = new THREE.Mesh(
              new THREE.BoxGeometry(1, 1, 1),
              new THREE.MeshStandardMaterial({ color: 'hotpink' })
            );
            useAppStore.getState().setCameraType('perspective');
            patchThree.getCurrentScene().add(cube);
            useAppStore.getState().setSelectedObject(cube);
            await waitFor(() => expect(patchThree.getTransformControls()).not.toBe(null));
            const transformControls = patchThree.getTransformControls()!;
            expect(transformControls.camera).toBe(defaultPerspectiveCamera);
            useAppStore.getState().setCameraType('orthographic');
            await waitFor(() => expect(transformControls.camera).toBe(defaultOrthographicCamera));
            await new Promise((resolve) => setTimeout(() => resolve(true), 100));
            useAppStore.getState().setCameraType('perspective');
            await waitFor(() => expect(transformControls.camera).toBe(defaultPerspectiveCamera));
            useAppStore.getState().setSelectedObject(null);
            await waitFor(() => expect(patchThree.getTransformControls()).toBe(null));
            res.unmount();
          }
        };

        const res = render(
          <TestDefaultApp onSetupEffect={handleSetupEffect} onCPanelUnmounted={done}></TestDefaultApp>,
          {
            container: document.getElementById('main')!
          }
        );
      });
    });
  });

  describe('scene change', () => {
    it('transfer helpers to new scene', { timeout: 7000 }, async () => {
      return new Promise<void>((done) => {
        const handleThreeChange: SetUpProps['onThreeChange'] = async (changed, three) => {
          if (changed === 'scene') {
            const { scene } = three;
            expect(scene).not.toBe(defaultScene);
            expect(scene.children.length).toBe(5); // AxesHelper, GridHelper, DirectionalLight, Mesh(floor), SpotLight
            expect(defaultScene.children.length).toBe(4); // DirectionalLightPicker, DirectionalLightHelper, SpotLightHelper, SpotLightPicker (dependentObjects for pre DirectionalLight, SpotLight)
            expect(defaultScene.children.map((c) => c.constructor).includes(THREE.SpotLightHelper)).toBe(true);
            expect(defaultScene.children.map((c) => c.constructor).includes(THREE.DirectionalLightHelper)).toBe(true);
            expect(defaultScene.children.map((c) => c.constructor).includes(SpotLightPicker)).toBe(true);
            expect(defaultScene.children.map((c) => c.constructor).includes(DirectionalLightPicker)).toBe(true);
            await waitFor(() => expect(defaultScene.children.length).toBe(0));
            expect(scene.children.length).toBe(9); // the 2 helpers, 2 pickers were added on top of the first 5 children
            expect(scene.children.map((c) => c.constructor).includes(THREE.SpotLightHelper)).toBe(true);
            expect(scene.children.map((c) => c.constructor).includes(THREE.DirectionalLightHelper)).toBe(true);
            res.unmount();
          }
        };

        const res = render(
          <TestInjectedInspectorApp onThreeChange={handleThreeChange} onCPanelUnmounted={done}>
            <spotLight
              castShadow
              position={[5.5, -0.7, 0.3]}
              scale={1}
              intensity={5.5}
              distance={8}
              color="deepskyblue"
              angle={Math.PI / 8}
              penumbra={0.5}
            ></spotLight>
          </TestInjectedInspectorApp>,
          {
            container: document.getElementById('main')!
          }
        );
      });
    });

    it('update cubeCameras if they exist in scene', { timeout: 1000 }, async () => {
      return new Promise<void>((done) => {
        const webGLCubeRenderTarget = new THREE.WebGLCubeRenderTarget(512);
        let cubeCameraRef: THREE.CubeCamera | null = null;
        let spyOnCubeCameraUpdate: MockInstance<() => void> | null = null;

        const onCubeCameraMounted = (cubeCamera: THREE.CubeCamera | null) => {
          if (cubeCamera) {
            cubeCameraRef = cubeCamera;
            spyOnCubeCameraUpdate = vi.spyOn(cubeCamera, 'update');
          }
        };

        const handleThreeChange: SetUpProps['onThreeChange'] = async (changed, three) => {
          if (changed === 'scene') {
            const { scene, gl } = three;
            expect(scene).not.toBe(defaultScene);
            expect(cubeCameraRef).toBeInstanceOf(THREE.CubeCamera);
            await waitFor(() => expect(spyOnCubeCameraUpdate?.mock.calls.length).toBe(1));
            expect(spyOnCubeCameraUpdate?.mock.calls[0]).toEqual([gl, scene]); // update(renderer, scene) has been called
            res.unmount();
          }
        };

        const res = render(
          <TestInjectedInspectorApp onThreeChange={handleThreeChange} onCPanelUnmounted={done}>
            <cubeCamera
              name="cubeCamera"
              args={[0.1, 100, webGLCubeRenderTarget]}
              position={[0, 0, 0]}
              rotation={[0, 0, 0]}
              ref={onCubeCameraMounted}
            ></cubeCamera>
          </TestInjectedInspectorApp>,
          {
            container: document.getElementById('main')!
          }
        );
      });
    });
  });
});

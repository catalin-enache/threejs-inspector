import { expect, describe, it, beforeEach, afterEach } from 'vitest';
import { render } from 'vitest-browser-react';
import { screen, within, waitFor } from '@testing-library/dom';
import { TestInjectedInspectorApp, TestDefaultApp, initDOM, clearDOM } from 'testutils/testApp';
import { defaultScene, defaultPerspectiveCamera } from 'lib/App/SetUp/patchThree';
import { OrbitControls as InternalOrbitControls } from 'lib/third_party/OrbitControls';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { SETUP_EFFECT, SetUpProps } from 'lib/App/SetUp/SetUp';
import { useAppStore } from 'src/store';
import patchThree from 'lib/App/SetUp/patchThree';

import { CPanelProps } from 'lib/App/CPanel/CPanel';
import { degToRad } from 'lib/utils';
import { loadModel } from 'lib/utils/loadModel';

describe('SetUp', () => {
  beforeEach(() => {
    initDOM();
  });

  afterEach(() => {
    clearDOM();
    useAppStore.getState().reset();
  });

  describe('OrbitControls', () => {
    it('Can be used with defaultScene and default(Perspective/Orthographic)Camera', { timeout: 1000 }, async () => {
      return new Promise<void>((done) => {
        const handleThreeChange: SetUpProps['onThreeChange'] = (changed, three) => {
          if (changed === 'scene') {
            const { scene } = three;
            expect(scene).toBe(defaultScene);
            expect(scene.__inspectorData.currentCamera).toBe(defaultPerspectiveCamera);
            res.unmount();
          }
        };

        const res = render(
          <TestInjectedInspectorApp
            useDreiOrbitControls={false}
            onThreeChange={handleThreeChange}
            useDefaultPerspectiveCamera={true}
            useDefaultScene={true}
            onCPanelUnmounted={done}
          ></TestInjectedInspectorApp>,
          {
            container: document.getElementById('main')!
          }
        );
      });
    });

    it('Can be used with custom scene and camera', { timeout: 1000 }, async () => {
      return new Promise<void>((done) => {
        const handleThreeChange: SetUpProps['onThreeChange'] = (changed, three) => {
          if (changed === 'scene') {
            const { scene } = three;
            expect(scene).not.toBe(defaultScene);
            expect(scene.__inspectorData.currentCamera).not.toBe(defaultPerspectiveCamera);
            res.unmount();
          }
        };

        const res = render(
          <TestInjectedInspectorApp
            useDreiOrbitControls={false}
            onThreeChange={handleThreeChange}
            onCPanelUnmounted={done}
          ></TestInjectedInspectorApp>,
          {
            container: document.getElementById('main')!
          }
        );
      });
    });

    it('Does not require OrbitControls', { timeout: 1000 }, async () => {
      return new Promise<void>((done) => {
        const handleSetupEffect: SetUpProps['onSetupEffect'] = (effect, data) => {
          if (effect === SETUP_EFFECT.ORBIT_CONTROLS) {
            expect(data.orbitControlsInUse).toBe(null);
            res.unmount();
          }
        };

        const res = render(
          <TestInjectedInspectorApp
            useDreiOrbitControls={false}
            autoNavControls={false}
            onSetupEffect={handleSetupEffect}
            onCPanelUnmounted={done}
          ></TestInjectedInspectorApp>,
          {
            container: document.getElementById('main')!
          }
        );
      });
    });

    it('Can use internal OrbitControls when autoNavControls is true', { timeout: 1000 }, async () => {
      return new Promise<void>((done) => {
        const handleSetupEffect: SetUpProps['onSetupEffect'] = (effect, data) => {
          if (effect === SETUP_EFFECT.ORBIT_CONTROLS) {
            expect(data.orbitControlsInUse).toBeInstanceOf(InternalOrbitControls);
            res.unmount();
          }
        };

        const res = render(
          <TestInjectedInspectorApp
            useDreiOrbitControls={false}
            autoNavControls={true}
            onSetupEffect={handleSetupEffect}
            onCPanelUnmounted={done}
          ></TestInjectedInspectorApp>,
          {
            container: document.getElementById('main')!
          }
        );
      });
    });

    it('Can be used with external OrbitControls', { timeout: 1000 }, async () => {
      return new Promise<void>((done) => {
        let calls = 0;
        const handleSetupEffect: SetUpProps['onSetupEffect'] = (effect, data) => {
          if (effect === SETUP_EFFECT.ORBIT_CONTROLS) {
            if (calls === 0) {
              expect(data.orbitControlsInUse).toBe(null);
            } else if (calls === 1) {
              expect(data.orbitControlsInUse).toBeInstanceOf(OrbitControlsImpl);
              res.unmount();
            }
            calls += 1;
          }
        };

        const res = render(
          <TestInjectedInspectorApp
            useDreiOrbitControls={true}
            autoNavControls={false}
            onSetupEffect={handleSetupEffect}
            onCPanelUnmounted={done}
          ></TestInjectedInspectorApp>,
          {
            container: document.getElementById('main')!
          }
        );
      });
    });

    it('Can be used with external OrbitControls even when autoNavControls is true', { timeout: 1000 }, async () => {
      return new Promise<void>((done) => {
        let calls = 0;
        const handleSetupEffect: SetUpProps['onSetupEffect'] = (effect, data) => {
          if (effect === SETUP_EFFECT.ORBIT_CONTROLS) {
            if (calls === 0) {
              expect(data.orbitControlsInUse).toBeInstanceOf(InternalOrbitControls);
            } else if (calls === 1) {
              expect(data.orbitControlsInUse).toBeInstanceOf(OrbitControlsImpl);
              res.unmount();
            }
            calls += 1;
          }
        };

        const res = render(
          <TestInjectedInspectorApp
            useDreiOrbitControls={true}
            autoNavControls={true}
            onSetupEffect={handleSetupEffect}
            onCPanelUnmounted={done}
          ></TestInjectedInspectorApp>,
          {
            container: document.getElementById('main')!
          }
        );
      });
    });

    it('OrbitControls are disabled when cameraControl !== `orbit', { timeout: 1000 }, async () => {
      return new Promise<void>((done) => {
        let calls = 0;
        const handleSetupEffect: SetUpProps['onSetupEffect'] = async (effect, data) => {
          if (effect === SETUP_EFFECT.ORBIT_CONTROLS) {
            if (calls === 0) {
              expect(data.orbitControlsInUse).toBeInstanceOf(InternalOrbitControls);
              expect(data.orbitControlsInUse.enabled).toBe(false);
              res.unmount();
            }
            calls += 1;
          }
        };

        useAppStore.getState().setCameraControl('fly');
        const res = render(
          <TestInjectedInspectorApp
            useDreiOrbitControls={false}
            autoNavControls={true}
            onSetupEffect={handleSetupEffect}
            onCPanelUnmounted={done}
          ></TestInjectedInspectorApp>,
          {
            container: document.getElementById('main')!
          }
        );
      });
    });

    it('Can switch from Fly control to Orbit control', { timeout: 1000 }, async () => {
      return new Promise<void>((done) => {
        let calls = 0;
        const _data: any[] = [];
        const handleSetupEffect: SetUpProps['onSetupEffect'] = async (effect, data) => {
          if (effect === SETUP_EFFECT.ORBIT_CONTROLS) {
            _data.push([useAppStore.getState().cameraControl, data.orbitControlsInUse.enabled]);

            calls += 1;

            if (calls === 2) {
              expect(_data).toEqual([
                ['fly', false],
                ['orbit', true]
              ]);
              res.unmount();
            }
          }
        };

        const handleCPanelReady: CPanelProps['onCPanelReady'] = async () => {
          expect(useAppStore.getState().cameraControl).toBe('fly');
          const cameraControl = await screen.findByText('Camera Control');
          const orbitButton = within(cameraControl.parentElement!.parentElement!).getByText('Orbit');
          orbitButton.click();
          await waitFor(() => expect(useAppStore.getState().cameraControl).toBe('orbit'));
        };

        useAppStore.getState().setCameraControl('fly');
        const res = render(
          <TestInjectedInspectorApp
            useDreiOrbitControls={true}
            autoNavControls={true}
            onSetupEffect={handleSetupEffect}
            onCPanelReady={handleCPanelReady}
            onCPanelUnmounted={done}
          ></TestInjectedInspectorApp>,
          {
            container: document.getElementById('main')!
          }
        );
      });
    });

    it('Can switch from Orbit control to Fly control', { timeout: 1000 }, async () => {
      return new Promise<void>((done) => {
        let calls = 0;
        const _data: any[] = [];
        const handleSetupEffect: SetUpProps['onSetupEffect'] = async (effect, data) => {
          if (effect === SETUP_EFFECT.ORBIT_CONTROLS) {
            _data.push([useAppStore.getState().cameraControl, data.orbitControlsInUse.enabled]);

            calls += 1;

            if (calls === 2) {
              expect(_data).toEqual([
                ['orbit', true],
                ['fly', false]
              ]);
              res.unmount();
            }
          }
        };

        const handleCPanelReady: CPanelProps['onCPanelReady'] = async () => {
          expect(useAppStore.getState().cameraControl).toBe('orbit');
          const cameraControl = await screen.findByText('Camera Control');
          const flyButton = within(cameraControl.parentElement!.parentElement!).getByText('Fly');
          flyButton.click();
          await waitFor(() => expect(useAppStore.getState().cameraControl).toBe('fly'));
        };

        useAppStore.getState().setCameraControl('orbit');
        const res = render(
          <TestInjectedInspectorApp
            useDreiOrbitControls={false}
            autoNavControls={true}
            onSetupEffect={handleSetupEffect}
            onCPanelReady={handleCPanelReady}
            onCPanelUnmounted={done}
          ></TestInjectedInspectorApp>,
          {
            container: document.getElementById('main')!
          }
        );
      });
    });

    it(
      'OrbitControls are disabled when playing and useOnPlay camera and not attachDefaultControllersToPlayingCamera',
      { timeout: 1000 },
      async () => {
        return new Promise<void>((done) => {
          const cPanelReady = { current: false };
          const handleSetupEffect: SetUpProps['onSetupEffect'] = async (effect, data) => {
            if (effect === SETUP_EFFECT.ORBIT_CONTROLS) {
              if (!cPanelReady.current) return;

              if (!data.orbitControlsInUse.enabled) {
                useAppStore.getState().setPlaying('stopped');
                res.unmount();
                cPanelReady.current = false;
              }
            }
          };

          const handleCPanelReady: CPanelProps['onCPanelReady'] = async () => {
            expect(useAppStore.getState().cameraControl).toBe('orbit');
            expect(useAppStore.getState().attachDefaultControllersToPlayingCamera).toBe(false);
            const playButton = await screen.findByText('Play');
            await waitFor(() => expect(useAppStore.getState().playingState).toBe('stopped'));
            // before play orbit controls are enabled
            playButton.click();
            // after play orbit controls are disabled
            await waitFor(() => expect(useAppStore.getState().playingState).toBe('playing'));
            cPanelReady.current = true;
          };

          useAppStore.getState().setAttachDefaultControllersToPlayingCamera(false);
          const res = render(
            <TestDefaultApp
              onSetupEffect={handleSetupEffect}
              onCPanelReady={handleCPanelReady}
              onCPanelUnmounted={done}
            >
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

  describe('shouldUseFlyControls', () => {
    it(
      'is true when cameraControl is `fly` and autoNavControls and not isPlaying or isPlaying and attachDefaultControllersToPlayingCamera is true',
      { timeout: 1000 },
      async () => {
        return new Promise<void>((done) => {
          const handleThreeChange: SetUpProps['onThreeChange'] = async (changed, three) => {
            const { camera } = three;
            if (changed === 'camera' && camera.name === 'DefaultPerspectiveCamera') {
              await waitFor(() => expect(patchThree.shouldUseFlyControls(camera)).toBe(true));
              useAppStore.getState().setPlaying('playing'); // will change camera to myPerspectiveCamera because is useOnPlay
            }
            if (changed === 'camera' && camera.name === 'myPerspectiveCamera') {
              await waitFor(() => expect(patchThree.shouldUseFlyControls(camera)).toBe(false)); // because not attaching controls to playing camera
              useAppStore.getState().setAttachDefaultControllersToPlayingCamera(true);
              await waitFor(() => expect(patchThree.shouldUseFlyControls(camera)).toBe(true));
              res.unmount();
            }
          };

          useAppStore.getState().setCameraControl('fly');
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
    it('set selected object', { timeout: 1000 }, async () => {
      return new Promise<void>((done) => {
        const sceneReady = { current: false };
        const handleThreeChange: SetUpProps['onThreeChange'] = async (changed, three) => {
          if (sceneReady.current) return;
          if (changed === 'scene') {
            sceneReady.current = true;
            const { scene, camera, gl } = three;
            loadModel('/models/MyTests/test_multi_features/test_multi_features.fbx', {
              isInspectable: true,
              scene,
              camera
            }).then((fbx) => {
              if (!fbx) return;
              fbx.name = 'fbx';
              scene.add(fbx);

              expect(scene.__inspectorData.transformControlsRef!.current!.object).toBe(undefined);

              setTimeout(async () => {
                // it seems we need to dispatch twice to get the correct three.pointer
                gl.domElement.dispatchEvent(
                  new MouseEvent('click', {
                    bubbles: true,
                    clientX: 360,
                    clientY: 200,
                    shiftKey: false
                  })
                );
                gl.domElement.dispatchEvent(
                  new MouseEvent('dblclick', {
                    bubbles: true,
                    clientX: 360,
                    clientY: 200,
                    shiftKey: false // selects root object
                  })
                );
                // three.pointer.x = -0.1;
                // three.pointer.y = 0.35;
                let selectedObject = useAppStore.getState().getSelectedObject()!;
                expect(selectedObject).toBe(fbx);
                expect(selectedObject.name).toBe('fbx');
                await waitFor(() =>
                  expect(scene.__inspectorData.transformControlsRef!.current!.object).toBe(selectedObject)
                );

                useAppStore.getState().setSelectedObject(null);
                gl.domElement.dispatchEvent(
                  new MouseEvent('dblclick', {
                    bubbles: true,
                    clientX: 360,
                    clientY: 200,
                    shiftKey: true // selects inside object when not isPicker
                  })
                );

                selectedObject = useAppStore.getState().getSelectedObject()!;
                expect(selectedObject.parent).toBe(fbx);
                expect(selectedObject.name).toBe('Armor_2_0');
                await waitFor(() =>
                  expect(scene.__inspectorData.transformControlsRef!.current!.object).toBe(selectedObject)
                );

                // make the child be a picker
                selectedObject.__inspectorData.isPicker = true;
                useAppStore.getState().setSelectedObject(null);
                gl.domElement.dispatchEvent(
                  new MouseEvent('dblclick', {
                    bubbles: true,
                    clientX: 360,
                    clientY: 200,
                    shiftKey: true // ignored when isPicker
                  })
                );

                selectedObject = useAppStore.getState().getSelectedObject()!;
                expect(selectedObject).toBe(fbx);
                expect(selectedObject.name).toBe('fbx');
                await waitFor(() =>
                  expect(scene.__inspectorData.transformControlsRef!.current!.object).toBe(selectedObject)
                );
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
});

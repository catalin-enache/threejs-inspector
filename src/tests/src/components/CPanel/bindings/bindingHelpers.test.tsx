import * as THREE from 'three';
import { LightProbeGenerator } from 'three/examples/jsm/lights/LightProbeGenerator';
import { expect, describe, it, beforeEach, afterEach, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { screen, waitFor } from '@testing-library/dom';
import { FolderApi, Pane } from 'tweakpane';
import { TestDefaultApp, initDOM, clearDOM } from 'testutils/testApp';
import { defaultScene } from 'lib/patchThree';
import { useAppStore } from 'src/store';
import { CPanelProps } from 'components/CPanel/CPanel';
import {
  buildBindings,
  eventListenersMap,
  cleanupContainer,
  getPaneTab,
  setSelectedTab
} from 'components/CPanel/bindings/bindingHelpers';
import { radToDegFormatter } from 'lib/utils/formatters';
import { loadModel } from 'lib/utils/loadModel';

const setObjectTab = async (pane: Pane) => {
  await waitFor(() => expect(pane.children.length).toBeGreaterThan(0));
  setSelectedTab(pane, 0);
  const objTab = getPaneTab(pane, 0);
  await waitFor(() => expect(objTab.selected).toBeTruthy());
  return objTab as unknown as FolderApi;
};

describe('bindingHelpers', () => {
  beforeEach(() => {
    initDOM();
  });

  afterEach(() => {
    defaultScene.clear();
    clearDOM();
    useAppStore.getState().reset();
  });

  describe('basic test', () => {
    it('they can be nested and can be interacted with', { timeout: 1000 }, async () => {
      return new Promise<void>((done) => {
        const handleCPanelReady: CPanelProps['onCPanelReady'] = async (pane, { commonGetterParamsRef }) => {
          const objTab = await setObjectTab(pane);
          const commonGetterParams = commonGetterParamsRef.current;
          const handleNumericChange = vi.fn((_value: any) => {
            // console.log('handleNumericChange', _value);
          });
          const handleStringChange = vi.fn((_value: any) => {
            // console.log('handleStringChange', _value);
          });
          const handleBooleanChange = vi.fn((_value: any) => {
            // console.log('handleBooleanChange', _value);
          });
          const handleButtonClick = vi.fn((_value: any) => {
            // console.log('handleButtonClick', _value);
          });

          const obj = {
            level_1: {
              level_2: {
                numeric: 0,
                string: 'string',
                boolean: false
              }
            }
          };

          const bindings = {
            level_1: {
              title: 'Level 1',
              level_2: {
                title: 'Level 2',
                numeric: {
                  label: 'Numeric Label',
                  onChange: handleNumericChange
                },
                string: {
                  label: 'String Label',
                  onChange: handleStringChange
                },
                boolean: {
                  label: 'Boolean Label',
                  onChange: handleBooleanChange
                },
                button: {
                  title: 'Button Title',
                  label: 'Button Label',
                  onClick: handleButtonClick
                }
              }
            }
          };

          buildBindings(objTab, obj, bindings, commonGetterParams);
          const level1Button = await screen.findByText('Level 1');
          level1Button.click();
          const level2Button = await screen.findByText('Level 2');
          level2Button.click();
          const numericLabel = await screen.findByText('Numeric Label');
          const numericInput = numericLabel.parentElement!.querySelector('input')!;
          numericInput.value = '1';
          numericInput.dispatchEvent(new Event('change'));
          await waitFor(() => expect(handleNumericChange).toHaveBeenCalledTimes(1));
          expect(numericInput.value).toBe('1.00');

          const stringLabel = await screen.findByText('String Label');
          const stringInput = stringLabel.parentElement!.querySelector('input')!;
          stringInput.value = 'new string';
          stringInput.dispatchEvent(new Event('change'));
          await waitFor(() => expect(handleStringChange).toHaveBeenCalledTimes(1));
          expect(stringInput.value).toBe('new string');

          const booleanLabel = await screen.findByText('Boolean Label');
          const booleanInput = booleanLabel.parentElement!.querySelector('input')!;
          booleanInput.click();
          await waitFor(() => expect(handleBooleanChange).toHaveBeenCalledTimes(1));
          expect(booleanInput.checked).toBeTruthy();

          const buttonLabel = await screen.findByText('Button Label');
          const buttonInput = buttonLabel.parentElement!.querySelector('button')!;
          buttonInput.click();
          await waitFor(() => expect(handleButtonClick).toHaveBeenCalledTimes(1));

          expect(handleNumericChange.mock.calls[0][0].bindings).toEqual({
            ...bindings.level_1.level_2,
            __parentObject: { level_2: obj.level_1.level_2 }
          });
          expect(handleNumericChange.mock.calls[0][0].object).toEqual(obj.level_1.level_2);
          // @ts-ignore
          expect(handleNumericChange.mock.calls[0][1].value).toEqual(1);

          expect(handleButtonClick.mock.calls[0][0].bindings).toEqual({
            ...bindings.level_1.level_2,
            __parentObject: { level_2: obj.level_1.level_2 }
          });
          expect(handleButtonClick.mock.calls[0][0].object).toEqual(obj.level_1.level_2);
          expect(handleButtonClick.mock.calls[0][0].folder.title).toEqual('Level 2');

          res.unmount();
        };

        const res = render(
          <TestDefaultApp onCPanelReady={handleCPanelReady} onCPanelUnmounted={done}></TestDefaultApp>,
          {
            container: document.getElementById('main')!
          }
        );
      });
    });
  });

  describe('when if() returns false', () => {
    it('does not render the binding or button', { timeout: 1000 }, async () => {
      return new Promise<void>((done) => {
        const handleCPanelReady: CPanelProps['onCPanelReady'] = async (pane, { commonGetterParamsRef }) => {
          const objTab = await setObjectTab(pane);
          const commonGetterParams = commonGetterParamsRef.current;
          const obj = {
            level_1: {
              level_2: {
                numeric_1: 1,
                numeric_2: 2
              }
            }
          };
          const bindings = {
            level_1: {
              title: 'Level 1',
              level_2: {
                title: 'Level 2',
                numeric_1: {
                  label: 'Numeric Label 1',
                  onChange: vi.fn()
                },
                numeric_2: {
                  label: 'Numeric Label 2',
                  onChange: vi.fn(),
                  if: vi.fn((_value: any) => {
                    return false;
                  })
                },
                button_1: {
                  title: 'Button Title 1',
                  label: 'Button Label 1',
                  onClick: vi.fn()
                },
                button_2: {
                  title: 'Button Title 2',
                  label: 'Button Label 2',
                  onClick: vi.fn(),
                  if: vi.fn((_value: any) => {
                    return false;
                  })
                }
              }
            }
          };

          buildBindings(objTab, obj, bindings, commonGetterParams);
          const numeric1Label = await screen.findByText('Numeric Label 1');
          const button1Label = await screen.findByText('Button Label 1');
          expect(numeric1Label).toBeInTheDocument();
          expect(button1Label).toBeInTheDocument();
          expect(screen.queryByText('Numeric Label 2')).toBeNull();
          expect(screen.queryByText('Button Label 2')).toBeNull();
          expect(bindings.level_1.level_2.numeric_2.if).toHaveBeenCalledWith(obj.level_1.level_2);
          expect(bindings.level_1.level_2.button_2.if).toHaveBeenCalledWith(obj.level_1.level_2);
          res.unmount();
        };

        const res = render(
          <TestDefaultApp onCPanelReady={handleCPanelReady} onCPanelUnmounted={done}></TestDefaultApp>,
          {
            container: document.getElementById('main')!
          }
        );
      });
    });
  });

  describe('when object[bindingKey] is array', () => {
    it('reuses the binding for all array items', { timeout: 1000 }, async () => {
      return new Promise<void>((done) => {
        const handleCPanelReady: CPanelProps['onCPanelReady'] = async (pane, { commonGetterParamsRef }) => {
          const objTab = await setObjectTab(pane);
          const commonGetterParams = commonGetterParamsRef.current;
          const obj = {
            level_1: {
              level_2: [
                {
                  numeric: 1
                },
                {
                  numeric: 2
                }
              ]
            }
          };
          const bindings = {
            level_1: {
              title: 'Level 1',
              level_2: {
                title: 'Level 2',
                numeric: {
                  label: 'Numeric Label',
                  onChange: vi.fn()
                }
              }
            }
          };

          buildBindings(objTab, obj, bindings, commonGetterParams);
          const numericLabels = await screen.findAllByText('Numeric Label');
          expect(numericLabels).toHaveLength(2);
          const input1 = numericLabels[0].parentElement!.querySelector('input')!;
          const input2 = numericLabels[1].parentElement!.querySelector('input')!;
          input1.value = '3';
          input1.dispatchEvent(new Event('change'));
          input2.value = '4';
          input2.dispatchEvent(new Event('change'));
          expect(bindings.level_1.level_2.numeric.onChange).toHaveBeenCalledTimes(2);
          expect(bindings.level_1.level_2.numeric.onChange.mock.calls[0][1].value).toEqual(3);
          expect(bindings.level_1.level_2.numeric.onChange.mock.calls[1][1].value).toEqual(4);
          res.unmount();
        };

        const res = render(
          <TestDefaultApp onCPanelReady={handleCPanelReady} onCPanelUnmounted={done}></TestDefaultApp>,
          {
            container: document.getElementById('main')!
          }
        );
      });
    });
  });

  describe('when binding has details', () => {
    it('renders the details and calls details.onChange', { timeout: 1000 }, async () => {
      return new Promise<void>((done) => {
        const handleCPanelReady: CPanelProps['onCPanelReady'] = async (pane, { commonGetterParamsRef }) => {
          const objTab = await setObjectTab(pane);
          const commonGetterParams = commonGetterParamsRef.current;
          const texture = new THREE.Texture();
          texture.image = new Image(256, 256);

          const obj = {
            level_1: {
              level_2: {
                texture: texture
              }
            }
          };
          const bindings = {
            level_1: {
              title: 'Level 1',
              level_2: {
                title: 'Level 2',
                texture: {
                  label: 'Texture',
                  gl: commonGetterParams.sceneObjects.gl,
                  details: {
                    offset: {
                      label: 'offset',
                      onChange: vi.fn((..._value: any) => {
                        // console.log('offset change', ..._value);
                      })
                    }
                  }
                }
              }
            }
          };

          buildBindings(objTab, obj, bindings, commonGetterParams);
          texture.dispose();
          const textureLabel = await screen.findByText('Texture');
          const offsetLabel = await screen.findByText('offset');

          expect(textureLabel).toBeInTheDocument();
          expect(offsetLabel).toBeInTheDocument();

          const offsetInput = offsetLabel.parentElement!.querySelector('input')!;
          offsetInput.value = '0.5';
          offsetInput.dispatchEvent(new Event('change'));

          await waitFor(() =>
            expect(bindings.level_1.level_2.texture.details.offset.onChange).toHaveBeenCalledTimes(1)
          );
          expect(bindings.level_1.level_2.texture.details.offset.onChange.mock.calls[0][1].value.x).toEqual(0.5);

          res.unmount();
        };

        const res = render(
          <TestDefaultApp onCPanelReady={handleCPanelReady} onCPanelUnmounted={done}></TestDefaultApp>,
          {
            container: document.getElementById('main')!
          }
        );
      });
    });
  });

  describe('when folders are expanded/collapsed (inside tweakFolder => adjustCPanelWidthFromNestedExpandedFolders)', () => {
    it('CPanel width is increased/decreased', { timeout: 1000 }, async () => {
      return new Promise<void>((done) => {
        const handleCPanelReady: CPanelProps['onCPanelReady'] = async (pane, { commonGetterParamsRef }) => {
          const objTab = await setObjectTab(pane);
          const commonGetterParams = commonGetterParamsRef.current;
          const handleNumericChange = vi.fn((_value: any) => {
            // console.log('handleNumericChange', _value);
          });

          const obj = {
            level_1: {
              level_2: {
                level_3: {
                  numeric: 0
                }
              }
            }
          };

          const bindings = {
            level_1: {
              title: 'Level 1',
              level_2: {
                title: 'Level 2',
                level_3: {
                  title: 'Level 3',
                  numeric: {
                    label: 'Numeric Label',
                    onChange: handleNumericChange
                  }
                }
              }
            }
          };

          buildBindings(objTab, obj, bindings, commonGetterParams);
          const cPanel = document.querySelector('#controlPanel')!;
          expect(getComputedStyle(cPanel).width).toBe('360px');
          const level3Button = await screen.findByText('Level 3');
          level3Button.click();
          expect(getComputedStyle(cPanel).width).toBe('370px');
          level3Button.click();
          expect(getComputedStyle(cPanel).width).toBe('360px');
          res.unmount();
        };

        const res = render(
          <TestDefaultApp onCPanelReady={handleCPanelReady} onCPanelUnmounted={done}></TestDefaultApp>,
          {
            container: document.getElementById('main')!
          }
        );
      });
    });
  });

  describe('when bindingCandidate.format === radToDegFormatter', () => {
    it('converts radians to degrees', { timeout: 1000 }, async () => {
      return new Promise<void>((done) => {
        const handleCPanelReady: CPanelProps['onCPanelReady'] = async (pane, { commonGetterParamsRef }) => {
          const objTab = await setObjectTab(pane);
          const commonGetterParams = commonGetterParamsRef.current;
          const handleNumericChange = vi.fn((_value: any, _evt: any) => {
            // console.log('handleNumericChange', _evt);
          });

          const obj = {
            level_1: {
              level_2: {
                numeric: 0
              }
            }
          };

          const bindings = {
            level_1: {
              title: 'Level 1',
              level_2: {
                title: 'Level 2',
                numeric: {
                  label: 'Numeric Label',
                  onChange: handleNumericChange,
                  format: radToDegFormatter
                }
              }
            }
          };
          // useAppStore.getState().setAngleFormat('rad'); // not needed
          buildBindings(objTab, obj, bindings, commonGetterParams);
          const numericLabel = await screen.findByText('Numeric Label');
          const numericInput = numericLabel.parentElement!.querySelector('input')!;
          numericInput.value = '1';
          numericInput.dispatchEvent(new Event('change'));
          await waitFor(() => expect(handleNumericChange).toHaveBeenCalledTimes(1));
          expect(handleNumericChange.mock.calls[0][1].value).toBe(0.017453292519943295);
          res.unmount();
        };

        const res = render(
          <TestDefaultApp onCPanelReady={handleCPanelReady} onCPanelUnmounted={done}></TestDefaultApp>,
          {
            container: document.getElementById('main')!
          }
        );
      });
    });
  });

  describe('collecting animations', () => {
    it('collects animations which can be played', { timeout: 5000 }, async () => {
      return new Promise<void>((done) => {
        const handleCPanelReady: CPanelProps['onCPanelReady'] = async (pane, { commonGetterParamsRef }) => {
          await setObjectTab(pane);
          const commonGetterParams = commonGetterParamsRef.current;

          const scene = commonGetterParams.sceneObjects.scene;
          const camera = commonGetterParams.sceneObjects.camera;
          const renderer = commonGetterParams.sceneObjects.gl;

          const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
          directionalLight.intensity = 6;
          directionalLight.position.set(0, 5, 5);
          directionalLight.castShadow = true;
          scene.add(directionalLight);

          const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(20, 20),
            new THREE.MeshStandardMaterial({ color: 'white', roughness: 0.2, metalness: 0, side: THREE.FrontSide })
          );
          floor.rotation.x = -Math.PI / 2;
          floor.receiveShadow = true;
          floor.__inspectorData.isInspectable = true;
          scene.add(floor);

          const lightProbe = new THREE.LightProbe();
          lightProbe.position.set(0, 1, -0.3);
          scene.add(lightProbe);

          const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(128, {
            format: THREE.RGBAFormat,
            generateMipmaps: true
          });
          const cubeCamera = new THREE.CubeCamera(0.1, 1000, cubeRenderTarget);
          cubeCamera.position.set(0, 2, -0.3);
          scene.add(cubeCamera);

          loadModel('/models/MyTests/test_multi_features/test_multi_features.glb', {
            scene,
            camera,
            recombineByMaterial: true
          }).then(async (mesh) => {
            if (!mesh) return;
            mesh.scale.set(1, 1, 1);
            mesh.castShadow = true;
            scene.add(mesh);

            cubeCamera.__inspectorData.helper!.visible = false;
            cubeCamera.update(renderer, scene);
            cubeCamera.__inspectorData.helper!.visible = true;
            const generatedLightProbe = await LightProbeGenerator.fromCubeRenderTarget(renderer, cubeRenderTarget);
            lightProbe.copy(generatedLightProbe);

            useAppStore.getState().setSelectedObject(mesh); // not needed
            const animationsFolder = await screen.findByText('Animations (3)');
            animationsFolder.click();
            const animAll = await screen.findAllByText('Anim_All');
            const animAllButton = [...animAll].find((el) => el.parentElement!.tagName === 'BUTTON')!.parentElement!;
            const animBottom = await screen.findAllByText('Anim_Bottom');
            const animBottomButton = [...animBottom].find(
              (el) => el.parentElement!.tagName === 'BUTTON'
            )!.parentElement!;
            const animTop = await screen.findAllByText('Anim_Top');
            const animTopButton = [...animTop].find((el) => el.parentElement!.tagName === 'BUTTON')!.parentElement!;
            const animReset = await screen.findAllByText('Reset');
            const animResetButton = [...animReset].find((el) => el.parentElement!.tagName === 'BUTTON')!.parentElement!;

            [animTopButton, animBottomButton, animAllButton, animResetButton].forEach((button) => {
              expect(button).toBeInTheDocument();
            });
            expect(Math.abs(mesh.children[0].children[1].rotation.z)).toBe(0);
            expect(mesh.__inspectorData.__cpCurrentPlayingAction).toBeNull();
            animBottomButton.click();
            setTimeout(() => {
              expect(Math.abs(mesh.children[0].children[1].rotation.z)).toBeGreaterThan(0); // animation started
              expect(mesh.__inspectorData.__cpCurrentPlayingAction?.getClip().name).toBe('Anim_Bottom');
              animResetButton.click();
              expect(Math.abs(mesh.children[0].children[1].rotation.z)).toBe(0); // animation has been reset
              expect(mesh.__inspectorData.__cpCurrentPlayingAction).toBeNull();
              res.unmount();
            }, 150);
          });
        };

        const res = render(
          <TestDefaultApp onCPanelReady={handleCPanelReady} onCPanelUnmounted={done}></TestDefaultApp>,
          {
            container: document.getElementById('main')!
          }
        );
      });
    });
  });

  describe('collecting morph targets', () => {
    it('collects morph targets which can be played', { timeout: 1000 }, async () => {
      return new Promise<void>((done) => {
        const handleCPanelReady: CPanelProps['onCPanelReady'] = async (pane, { commonGetterParamsRef }) => {
          await setObjectTab(pane);
          const commonGetterParams = commonGetterParamsRef.current;

          const scene = commonGetterParams.sceneObjects.scene;
          const camera = commonGetterParams.sceneObjects.camera;

          const ambientLight = new THREE.AmbientLight(0xffffff, 1);
          scene.add(ambientLight);

          loadModel('/models/MyTests/test_multi_features/test_multi_features.glb', {
            scene,
            camera,
            recombineByMaterial: true
          }).then(async (mesh) => {
            if (!mesh) return;
            mesh.scale.set(1, 1, 1);
            mesh.castShadow = true;
            scene.add(mesh);

            useAppStore.getState().setSelectedObject(mesh); // not needed

            const morphTargetsFolder = await screen.findByText('Morph Targets (2)');
            morphTargetsFolder.click();

            const morphInputs = morphTargetsFolder.parentElement!.parentElement!.querySelectorAll('input')!;
            const morphInput1 = morphInputs[0] as HTMLInputElement;
            const morphInput2 = morphInputs[1] as HTMLInputElement;

            const morphTargetInfluencesBefore = mesh.children[0].children[0].children.map(
              (child) => (child as THREE.SkinnedMesh).morphTargetInfluences
            );
            expect(morphTargetInfluencesBefore).toEqual([
              [0, 0],
              [0, 0],
              [0, 0],
              [0, 0]
            ]);

            morphInput1.value = '0.5';
            morphInput1.dispatchEvent(new Event('change'));
            morphInput2.value = '0.4';
            morphInput2.dispatchEvent(new Event('change'));

            const morphTargetInfluencesAfter = mesh.children[0].children[0].children.map(
              (child) => (child as THREE.SkinnedMesh).morphTargetInfluences
            );

            expect(morphTargetInfluencesAfter).toEqual([
              [0.5, 0.4],
              [0.5, 0.4],
              [0.5, 0.4],
              [0.5, 0.4]
            ]);

            res.unmount();
          });
        };

        const res = render(
          <TestDefaultApp onCPanelReady={handleCPanelReady} onCPanelUnmounted={done}></TestDefaultApp>,
          {
            container: document.getElementById('main')!
          }
        );
      });
    });
  });

  describe('collecting materials inventory', () => {
    it('collects materials from all descendants', { timeout: 1000 }, async () => {
      return new Promise<void>((done) => {
        const handleCPanelReady: CPanelProps['onCPanelReady'] = async (pane, { commonGetterParamsRef }) => {
          await setObjectTab(pane);
          const commonGetterParams = commonGetterParamsRef.current;

          const scene = commonGetterParams.sceneObjects.scene;
          const camera = commonGetterParams.sceneObjects.camera;

          const ambientLight = new THREE.AmbientLight(0xffffff, 1);
          scene.add(ambientLight);

          loadModel('/models/MyTests/test_multi_features/test_multi_features.glb', {
            scene,
            camera,
            recombineByMaterial: true
          }).then(async (mesh) => {
            if (!mesh) return;
            mesh.scale.set(1, 1, 1);
            mesh.castShadow = true;
            scene.add(mesh);

            useAppStore.getState().setSelectedObject(mesh); // not needed

            const materialsFolder = await screen.findByText('Materials Inventory (5)');
            materialsFolder.click();
            expect(materialsFolder.parentElement!.parentElement!.childNodes[2].childNodes.length).toBe(5);
            res.unmount();
          });
        };

        const res = render(
          <TestDefaultApp onCPanelReady={handleCPanelReady} onCPanelUnmounted={done}></TestDefaultApp>,
          {
            container: document.getElementById('main')!
          }
        );
      });
    });
  });

  describe('rendering children', () => {
    it('renders children', { timeout: 1000 }, async () => {
      return new Promise<void>((done) => {
        const handleCPanelReady: CPanelProps['onCPanelReady'] = async (pane, { commonGetterParamsRef }) => {
          await setObjectTab(pane);
          const commonGetterParams = commonGetterParamsRef.current;

          const scene = commonGetterParams.sceneObjects.scene;
          const camera = commonGetterParams.sceneObjects.camera;

          const ambientLight = new THREE.AmbientLight(0xffffff, 1);
          scene.add(ambientLight);

          loadModel('/models/MyTests/test_multi_features/test_multi_features.glb', {
            scene,
            camera,
            recombineByMaterial: true
          }).then(async (mesh) => {
            if (!mesh) return;
            mesh.scale.set(1, 1, 1);
            mesh.castShadow = true;
            scene.add(mesh);

            useAppStore.getState().setSelectedObject(mesh); // not needed

            const childrenFolder = await screen.findByText('Children (1)');
            childrenFolder.click();
            const armatureChildrenFolder = await screen.findByText('Armature');
            armatureChildrenFolder.click();
            const armatureChildrenChildrenFolder = await screen.findByText('Children (4)');
            armatureChildrenChildrenFolder.click();
            const cylinderChild = await screen.findByText('Cylinder');
            const bottomChild = await screen.findByText('Bottom');
            const armor_1_0Child = await screen.findByText('Armor_1_0');
            const armor_2_0Child = await screen.findByText('Armor_2_0');

            expect(cylinderChild).toBeInTheDocument();
            expect(bottomChild).toBeInTheDocument();
            expect(armor_1_0Child).toBeInTheDocument();
            expect(armor_2_0Child).toBeInTheDocument();

            res.unmount();
          });
        };

        const res = render(
          <TestDefaultApp onCPanelReady={handleCPanelReady} onCPanelUnmounted={done}></TestDefaultApp>,
          {
            container: document.getElementById('main')!
          }
        );
      });
    });
  });

  describe('cleanupContainer (basic test)', () => {
    describe('when disposeRootFolder is false', () => {
      it('disposes all nodes except root folder', { timeout: 1000 }, async () => {
        const pane = new Pane();
        const folder1 = pane.addFolder({ title: 'folder1' });
        folder1.title = 'folder1';
        const binding1 = folder1.addBinding({ value: 0 }, 'value', { label: 'binding1' });
        binding1.label = 'binding1';
        const folder2 = folder1.addFolder({ title: 'folder2' });
        folder2.title = 'folder2';
        const binding2 = folder2.addBinding({ value: 0 }, 'value', { label: 'binding2' });
        binding2.label = 'binding2';
        const folder3 = folder2.addFolder({ title: 'folder3' });
        folder3.title = 'folder3';
        const binding3 = folder3.addBinding({ value: 0 }, 'value', { label: 'binding3' });
        binding3.label = 'binding3';

        const disposeSpy1 = vi.spyOn(folder1, 'dispose');
        const disposeSpy2 = vi.spyOn(folder2, 'dispose');
        const disposeSpy3 = vi.spyOn(folder3, 'dispose');

        const disposeSpyBinding1 = vi.spyOn(binding1, 'dispose');
        const disposeSpyBinding2 = vi.spyOn(binding2, 'dispose');
        const disposeSpyBinding3 = vi.spyOn(binding3, 'dispose');

        cleanupContainer(folder1, { disposeRootFolder: false });

        expect(disposeSpy1).not.toHaveBeenCalled();
        expect(disposeSpy2).toHaveBeenCalled();
        expect(disposeSpy3).toHaveBeenCalled();
        expect(disposeSpyBinding1).toHaveBeenCalled();
        expect(disposeSpyBinding2).toHaveBeenCalled();
        expect(disposeSpyBinding3).toHaveBeenCalled();
      });
    });

    describe('when disposeRootFolder is true', () => {
      it('disposes all nodes including root folder', { timeout: 1000 }, async () => {
        const pane = new Pane();
        const folder1 = pane.addFolder({ title: 'folder1' });
        folder1.title = 'folder1';
        const binding1 = folder1.addBinding({ value: 0 }, 'value', { label: 'binding1' });
        binding1.label = 'binding1';
        const folder2 = folder1.addFolder({ title: 'folder2' });
        folder2.title = 'folder2';
        const binding2 = folder2.addBinding({ value: 0 }, 'value', { label: 'binding2' });
        binding2.label = 'binding2';
        const folder3 = folder2.addFolder({ title: 'folder3' });
        folder3.title = 'folder3';
        const binding3 = folder3.addBinding({ value: 0 }, 'value', { label: 'binding3' });
        binding3.label = 'binding3';

        const disposeSpy1 = vi.spyOn(folder1, 'dispose');
        const disposeSpy2 = vi.spyOn(folder2, 'dispose');
        const disposeSpy3 = vi.spyOn(folder3, 'dispose');

        const disposeSpyBinding1 = vi.spyOn(binding1, 'dispose');
        const disposeSpyBinding2 = vi.spyOn(binding2, 'dispose');
        const disposeSpyBinding3 = vi.spyOn(binding3, 'dispose');

        cleanupContainer(folder1, { disposeRootFolder: true });

        expect(disposeSpy1).toHaveBeenCalled();
        expect(disposeSpy2).toHaveBeenCalled();
        expect(disposeSpy3).toHaveBeenCalled();
        expect(disposeSpyBinding1).toHaveBeenCalled();
        expect(disposeSpyBinding2).toHaveBeenCalled();
        expect(disposeSpyBinding3).toHaveBeenCalled();
      });
    });
  });

  describe('cleanupContainer (real test)', () => {
    describe('when disposeRootFolder is true', () => {
      it('cleans up event listeners', { timeout: 1000 }, async () => {
        return new Promise<void>((done) => {
          const handleCPanelReady: CPanelProps['onCPanelReady'] = async (pane, { commonGetterParamsRef }) => {
            const objTab = await setObjectTab(pane);
            const commonGetterParams = commonGetterParamsRef.current;
            const handleNumericChange = vi.fn((_value: any) => {
              // console.log('handleNumericChange', _value);
            });

            const obj = {
              level_1: {
                level_2: {
                  numeric: 0
                }
              }
            };

            const bindings = {
              level_1: {
                title: 'Level 1',
                level_2: {
                  title: 'Level 2',
                  numeric: {
                    label: 'Numeric Label',
                    onChange: handleNumericChange
                  }
                }
              }
            };

            const objectTabFolderSpy = vi.spyOn(objTab, 'dispose');

            const listenersMap1 = Array.from(eventListenersMap);

            buildBindings(objTab, obj, bindings, commonGetterParams);

            const listenersMap2 = Array.from(eventListenersMap);

            const listenerDiff1 = listenersMap2.filter(([key]) => !listenersMap1.map(([key]) => key).includes(key));

            // 2 entries for listeners added
            expect(listenerDiff1).toHaveLength(2);

            const level1Folder = objTab.children[0] as FolderApi;
            const disposeLevel1FolderSpy = vi.spyOn(level1Folder, 'dispose');
            expect(level1Folder.title).toBe('Level 1');

            const level2Folder = level1Folder.children[0] as FolderApi;
            expect(level2Folder.title).toBe('Level 2');
            const disposeLevel2FolderSpy = vi.spyOn(level2Folder, 'dispose');

            cleanupContainer(level1Folder, { disposeRootFolder: true });

            const listenersMap3 = Array.from(eventListenersMap);

            const listenerDiff2 = listenersMap3.filter(([key]) => !listenersMap1.map(([key]) => key).includes(key));

            expect(listenerDiff2).toHaveLength(0);

            expect(objectTabFolderSpy).not.toHaveBeenCalled();
            expect(disposeLevel1FolderSpy).toHaveBeenCalled();
            expect(disposeLevel2FolderSpy).toHaveBeenCalled();

            res.unmount();
          };

          const res = render(
            <TestDefaultApp onCPanelReady={handleCPanelReady} onCPanelUnmounted={done}></TestDefaultApp>,
            {
              container: document.getElementById('main')!
            }
          );
        });
      });
    });

    describe('when disposeRootFolder is false', () => {
      it('cleans up event listeners', { timeout: 1000 }, async () => {
        return new Promise<void>((done) => {
          const handleCPanelReady: CPanelProps['onCPanelReady'] = async (pane, { commonGetterParamsRef }) => {
            const objTab = await setObjectTab(pane);
            const commonGetterParams = commonGetterParamsRef.current;
            const handleNumericChange = vi.fn((_value: any) => {
              // console.log('handleNumericChange', _value);
            });

            const obj = {
              level_1: {
                level_2: {
                  numeric: 0
                }
              }
            };

            const bindings = {
              level_1: {
                title: 'Level 1',
                level_2: {
                  title: 'Level 2',
                  numeric: {
                    label: 'Numeric Label',
                    onChange: handleNumericChange
                  }
                }
              }
            };

            const objectTabFolderSpy = vi.spyOn(objTab, 'dispose');

            const listenersMap1 = Array.from(eventListenersMap);

            buildBindings(objTab, obj, bindings, commonGetterParams);

            const listenersMap2 = Array.from(eventListenersMap);

            const listenerDiff1 = listenersMap2.filter(([key]) => !listenersMap1.map(([key]) => key).includes(key));

            // 2 entries for listeners added
            expect(listenerDiff1).toHaveLength(2);

            const level1Folder = objTab.children[0] as FolderApi;
            const disposeLevel1FolderSpy = vi.spyOn(level1Folder, 'dispose');
            expect(level1Folder.title).toBe('Level 1');

            const level2Folder = level1Folder.children[0] as FolderApi;
            expect(level2Folder.title).toBe('Level 2');
            const disposeLevel2FolderSpy = vi.spyOn(level2Folder, 'dispose');

            expect(listenerDiff1[1][0]).toBe(level1Folder.element.children[0]); // the level1Folder button
            expect(listenerDiff1[1][1].click.size).toBe(2); // 2 click listeners
            expect([...listenerDiff1[1][1].click][0].name).toBe('memoizeExpandedState');
            expect([...listenerDiff1[1][1].click][1].name).toBe('dispatchTransitionEnd');

            cleanupContainer(level1Folder, { disposeRootFolder: false });

            const listenersMap3 = Array.from(eventListenersMap);

            const listenerDiff2 = listenersMap3.filter(([key]) => !listenersMap1.map(([key]) => key).includes(key));

            expect(listenerDiff2).toHaveLength(1); // one element still listening

            expect(listenerDiff2[0][0]).toBe(level1Folder.element.children[0]); // the level1Folder button
            expect(listenerDiff2[0][1].click.size).toBe(1); // one click listener remaining
            expect([...listenerDiff2[0][1].click][0].name).toBe('memoizeExpandedState');

            expect(objectTabFolderSpy).not.toHaveBeenCalled();
            expect(disposeLevel1FolderSpy).not.toHaveBeenCalled();
            expect(disposeLevel2FolderSpy).toHaveBeenCalled();

            res.unmount();
          };

          const res = render(
            <TestDefaultApp onCPanelReady={handleCPanelReady} onCPanelUnmounted={done}></TestDefaultApp>,
            {
              container: document.getElementById('main')!
            }
          );
        });
      });
    });
  });
});

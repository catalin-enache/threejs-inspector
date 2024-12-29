import { expect, describe, it, beforeEach, afterEach, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { screen, waitFor } from '@testing-library/dom';
import { FolderApi, Pane } from 'tweakpane';
import { TestDefaultApp, initDOM, clearDOM } from 'testutils/testApp';
import { defaultScene } from 'lib/App/SetUp/patchThree';
import { useAppStore } from 'src/store';
import { CPanelProps } from 'lib/App/CPanel/CPanel';
import { getPaneTab, setSelectedTab } from 'lib/App/CPanel/CPanel';
import { buildBindings } from 'lib/App/CPanel/bindings/bindingHelpers';
import * as THREE from 'three';

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
    it('renders the details', { timeout: 1000 }, async () => {
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
                    uuid: {
                      label: 'uuid'
                    }
                  }
                }
              }
            }
          };

          buildBindings(objTab, obj, bindings, commonGetterParams);
          texture.dispose();
          const textureLabel = await screen.findByText('Texture');
          const uuidLabel = await screen.findByText('uuid');

          expect(textureLabel).toBeInTheDocument();
          expect(uuidLabel).toBeInTheDocument();

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

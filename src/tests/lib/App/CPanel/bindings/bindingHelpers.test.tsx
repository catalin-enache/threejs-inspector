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
    it('they can be nested and can be interacted with', { timeout: 61000 }, async () => {
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
          const handleButtonClick = vi.fn(() => {
            // console.log('handleButtonClick');
          });
          console.log({ objTab, commonGetterParams });
          buildBindings(
            objTab,
            {
              level_1: {
                level_2: {
                  numeric: 0,
                  string: 'string',
                  boolean: false
                }
              }
            },
            {
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
            },
            commonGetterParams
          );
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

import { expect, describe, it, beforeEach, afterEach, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { screen, waitFor } from '@testing-library/dom';
import { TestInjectedInspectorApp, initDOM, clearDOM } from 'testutils/testApp';
import { defaultScene } from 'lib/patchThree';
import { useAppStore } from 'src/store';
import { CPanelProps } from 'components/CPanel/CPanel';
import { CustomControl } from 'components/CustomControl/CustomControl';

describe('CustomControl with injected Inspector in R3F App', () => {
  beforeEach(() => {
    initDOM();
  });

  afterEach(() => {
    defaultScene.clear();
    clearDOM();
    useAppStore.getState().reset();
  });

  it('Can mix R3F CustomControl with native CustomParams', { timeout: 61000 }, async () => {
    return new Promise<void>((done) => {
      const handleChange = vi.fn((_value: any) => {
        // console.log(_value);
      });

      const params = {
        asset: 'two',
        assets: ['one', 'two', 'three']
      };

      // Note, these custom params are merged with custom params from App CustomParams
      const customParams = {
        Select: {
          object: params,
          prop: 'asset',
          control: {
            label: 'Asset',
            options: params.assets.reduce((acc, asset) => {
              acc[asset] = asset;
              return acc;
            }, {} as any),
            onChange: handleChange
          }
        }
      };

      const numeric = { value: 0 };

      const handleCPanelReady: CPanelProps['onCPanelReady'] = async () => {
        const myChildButton = await screen.findByText('My Child');
        myChildButton.click();
        expect(numeric.value).toBe(0);
        const myControlLabel = await screen.findByText('My Control');
        const myControlInput = myControlLabel.parentElement!.querySelector('input')!;
        myControlInput.value = '1';
        myControlInput.dispatchEvent(new Event('change'));
        await waitFor(() => expect(handleChange).toHaveBeenCalledTimes(1));
        expect(numeric.value).toBe(1);

        expect(params.asset).toBe('two');
        const selectLabel = await screen.findByText('Asset');
        const selectInput = selectLabel.parentElement!.querySelector('select')!;
        selectInput.value = 'three';
        selectInput.dispatchEvent(new Event('change'));
        await waitFor(() => expect(handleChange).toHaveBeenCalledTimes(2));
        expect(params.asset).toBe('three');
        res.unmount();
      };

      const res = render(
        <TestInjectedInspectorApp
          useDreiOrbitControls={false}
          useDefaultPerspectiveCamera={true}
          useDefaultScene={true}
          onCPanelReady={handleCPanelReady}
          onCPanelUnmounted={done}
          customParams={customParams}
        >
          <CustomControl
            name={'myControl'}
            control={{
              label: 'My Control',
              onChange: handleChange
            }}
            object={numeric}
            prop={'value'}
            path="My Parent/My Child"
          />
        </TestInjectedInspectorApp>,
        {
          container: document.getElementById('main')!
        }
      );
    });
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { BindingParams } from 'tweakpane';
import { screen, waitFor } from '@testing-library/dom';
import { defaultScene } from 'lib/App/SetUp/patchThree';
import { useAppStore } from 'src/store';
import { CPanelProps } from 'lib/App/CPanel/CPanel';
import { initNativeApp, InitNativeAppProps } from 'testutils/testNativeApp';

describe('Custom Params', () => {
  beforeEach(() => {});

  afterEach(() => {
    defaultScene.clear();
    useAppStore.getState().reset();
  });

  it('can be changed at runtime and have nested structure', { timeout: 1000 }, async () => {
    return new Promise<void>((done) => {
      const spyOnRemoveCPanelCustomParams = vi.spyOn(useAppStore.getState(), 'removeCPanelCustomParams');
      const spyOnSetOrUpdateCPanelCustomParams = vi.spyOn(useAppStore.getState(), 'setOrUpdateCPanelCustomParams');

      // prettier-ignore
      const selectObject = { asset: 'Samba Dancing' };
      const morphObject = { val1: 0, val2: 0 };

      const handleValueChange = vi.fn();

      const customParamsMorph = {
        nested: {
          level: {
            key_1: {
              object: morphObject,
              prop: 'val1',
              control: {
                label: 'Key 1',
                min: 0,
                max: 1,
                onChange: handleValueChange
              } as BindingParams
            },
            key_2: {
              object: morphObject,
              prop: 'val2',
              control: {
                label: 'Key 2',
                min: 0,
                max: 1,
                onChange: handleValueChange
              } as BindingParams
            }
          }
        }
      };

      const handleCParamChange = (value: string) => {
        if (value === 'morph_test') {
          customParams.morph = customParamsMorph;
        } else {
          delete customParams.morph;
        }
        updateInspector({ customParams });
      };

      const customParams: NonNullable<InitNativeAppProps['customParams']> = {
        asset: {
          object: selectObject,
          prop: 'asset',
          control: {
            label: 'Asset',
            options: ['Samba Dancing', 'morph_test'].reduce((acc, option) => {
              acc[option] = option;
              return acc;
            }, {} as any),
            onChange: handleCParamChange
          } as BindingParams
        }
      };

      const handleCPanelReady: CPanelProps['onCPanelReady'] = async () => {
        const cParams = useAppStore.getState().getCPanelCustomParams();
        await waitFor(() => expect('asset' in cParams).toBe(true));
        const selectInput = await screen.findByText('Samba Dancing');
        // change select value to 'morph_test'
        // @ts-ignore
        selectInput.parentElement!.value = 'morph_test';
        selectInput!.parentElement!.dispatchEvent(new Event('change'));
        // expand panels
        const nested = await screen.findByText('nested');
        nested.click();
        const level = await screen.findByText('level');
        level.click();
        // check if the nested structure is rendered and change values
        const key_1 = await screen.findByText('Key 1');
        const key_1Input = key_1.parentElement!.querySelector('input');
        key_1Input!.value = '0.5';
        key_1Input!.dispatchEvent(new Event('change'));
        expect(morphObject.val1).toBe(0.5);
        const key_2 = await screen.findByText('Key 2');
        const key_2Input = key_2.parentElement!.querySelector('input');
        key_2Input!.value = '0.6';
        key_2Input!.dispatchEvent(new Event('change'));
        expect(morphObject.val2).toBe(0.6);
        expect(handleValueChange).toHaveBeenCalledTimes(2);
        // prettier-ignore
        expect(handleValueChange.mock.calls).toEqual([[0.5, morphObject, 'val1'], [0.6, morphObject, 'val2']]);
        expect(Object.keys(cParams)).toEqual(['asset', 'morph']);
        // switch back to 'Samba Dancing'
        // @ts-ignore
        selectInput.parentElement!.value = 'Samba Dancing';
        selectInput!.parentElement!.dispatchEvent(new Event('change'));
        // expect morph param to be removed after 'morph' related CustomControl has been unmounted
        await waitFor(() => expect('morph' in cParams).toBe(false));
        unmountInspector();
      };

      const handleCPanelUnmounted: CPanelProps['onCPanelUnmounted'] = async () => {
        const cParams = useAppStore.getState().getCPanelCustomParams();
        expect(Object.keys(cParams)).toEqual(['asset']);
        await waitFor(() => expect('asset' in cParams).toBe(false));
        // expect cParams to be cleaned up after all CustomControls were unmounted
        expect(Object.keys(cParams)).toEqual([]);
        // prettier-ignore
        expect(spyOnSetOrUpdateCPanelCustomParams.mock.calls).toEqual([
          ['asset', selectObject, customParams.asset.prop, customParams.asset.control, []],
          ['key_1', morphObject, customParamsMorph.nested.level.key_1.prop, customParamsMorph.nested.level.key_1.control, ['morph', 'nested', 'level']],
          ['key_2', morphObject, customParamsMorph.nested.level.key_2.prop, customParamsMorph.nested.level.key_2.control, ['morph', 'nested', 'level']]
        ]);
        expect(spyOnRemoveCPanelCustomParams.mock.calls).toEqual([
          ['key_1', ['morph', 'nested', 'level']],
          ['key_2', ['morph', 'nested', 'level']],
          ['asset', []]
        ]);
        spyOnRemoveCPanelCustomParams.mockRestore();
        spyOnSetOrUpdateCPanelCustomParams.mockRestore();
        cleanUp();
        done();
      };

      const { cleanUp, updateInspector, unmountInspector } = initNativeApp({
        autoNavControls: true,
        customParams,
        onCPanelReady: handleCPanelReady,
        onCPanelUnmounted: handleCPanelUnmounted
      });
    });
  });
});

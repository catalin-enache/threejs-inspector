import { useAppStore } from 'src/store';
import type { onChange, CommonGetterParams } from './bindingTypes';
import { numberFormat } from 'components/CPanel/bindings/bindingHelpers';

export const ObjectStoreBindings = (_params: CommonGetterParams) => ({
  transformControlsMode: {
    label: 'TMode ( ,./ )',
    view: 'radiogrid',
    groupName: 'transformControlsMode',
    size: [3, 1],
    cells: (x: number, _y: number) => ({
      title: x === 0 ? 'Translate' : x === 1 ? 'Rotate' : 'Scale',
      value: x === 0 ? 'translate' : x === 1 ? 'rotate' : 'scale'
    }),
    onChange: ((_, evt: any) => {
      useAppStore.getState().setTransformControlsMode(evt.value);
    }) as onChange
  },
  transformControlsSpace: {
    label: "TSpace ( ;' )",
    view: 'radiogrid',
    groupName: 'transformControlsSpace',
    size: [2, 1],
    cells: (x: number, _y: number) => ({
      title: x === 0 ? 'World' : 'Local',
      value: x === 0 ? 'world' : 'local'
    }),
    onChange: ((_, space) => {
      useAppStore.getState().setTransformControlsSpace(space.value);
    }) as onChange
  },
  positionPointerKeyMultiplier: {
    label: 'Position Pointer/Key Multiplier (refresh)',
    keyScale: 0.1,
    pointerScale: 0.1,
    step: 0.1,
    format: numberFormat(1),
    onChange: ((_, evt) => {
      const value = evt.value as { x: number; y: number };
      useAppStore.getState().setPositionPointerKeyMultiplier(value);
    }) as onChange
  }
});

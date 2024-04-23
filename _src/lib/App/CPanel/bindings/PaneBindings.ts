import { useAppStore } from 'src/store';
import type { onChange } from './bindingTypes';

export const PaneBindings = () => ({
  cPanelContinuousUpdate: {
    label: 'Continuous Update ( U )',
    onChange: ((_, evt) => {
      useAppStore.getState().setCPanelContinuousUpdate(evt.value);
    }) as onChange
  },
  angleFormat: {
    label: 'Angle Format ( [ )',
    view: 'radiogrid',
    groupName: 'angleFormat',
    size: [2, 1],
    cells: (x: number, _y: number) => ({
      title: x === 0 ? 'Deg' : 'Rad',
      value: x === 0 ? 'deg' : 'rad'
    }),
    onChange: ((_, evt: any) => {
      useAppStore.getState().setAngleFormat(evt.value);
    }) as onChange
  }
});

import { useAppStore } from 'src/store';
import type { onChange } from './bindingTypes';
import { numberCommon } from './bindingHelpers';

const docStyle = document.documentElement.style;

export const PaneBindings = () => ({
  cPanelContinuousUpdate: {
    label: 'Continuous Update ( U )',
    onChange: ((_, evt) => {
      useAppStore.getState().setCPanelContinuousUpdate(evt.value);
    }) as onChange
  },
  cPanelOpacity: {
    label: 'Opacity',
    ...numberCommon,
    min: 0,
    max: 1,
    onChange: ((_, evt) => {
      docStyle.setProperty('--tp-base-background-opacity', evt.value.toFixed(2));
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

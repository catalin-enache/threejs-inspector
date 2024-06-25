import { useAppStore } from 'src/store';
import type { onChange, CommonGetterParams } from './bindingTypes';
import { numberCommon } from './bindingHelpers';

export const PaneBindings = (_params: CommonGetterParams) => {
  const docStyle = document.documentElement.style;
  const helpContainerStyle = document.getElementById('help')!.style;
  const cPanelStyle = document.getElementById('controlPanel')!.style;
  return {
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
      format: (value: number) => value.toFixed(2),
      onChange: ((_, evt) => {
        docStyle.setProperty('--tp-base-background-opacity', evt.value.toFixed(2));
        useAppStore.getState().setCPanelOpacity(evt.value.toFixed(2));
      }) as onChange
    },
    cPanelSize: {
      label: 'Size',
      ...numberCommon,
      step: 1,
      pointerScale: 1,
      keyScale: 1,
      min: 280, // tuned in relation with cPanel binding-value width in CSS
      max: 800,
      onChange: ((_, evt) => {
        cPanelStyle.setProperty('--cPanelWidth', `${evt.value.toFixed(2)}px`);
      }) as onChange
    },
    cPanelShowHelp: {
      label: 'Help',
      title: 'Toggle Help',
      onClick: (() => {
        useAppStore.getState().toggleCPanelShowHelp();
        const showHelp = useAppStore.getState().cPanelShowHelp;
        helpContainerStyle.display = showHelp ? 'block' : 'none';
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
  };
};

import type { onChange } from './bindingTypes';

export const LightShadowBindings = () => ({
  mapSize: {
    label: 'MapSize',
    step: 1,
    // TODO: maybe get rid of __parent, __sceneObjects
    onChange: (({ object }) => {
      if (object.__parent?.shadow?.map) {
        object.__parent.shadow.map.dispose();
        object.__parent.shadow.map = null;
      }
    }) as onChange
  },
  radius: {
    label: 'Radius',
    min: 0
  },
  blurSamples: {
    label: 'Blur Samples',
    step: 1,
    min: 0
  },
  bias: {
    label: 'Bias',
    step: 0.0001
  },
  normalBias: {
    label: 'Normal bias',
    step: 1
  }
});

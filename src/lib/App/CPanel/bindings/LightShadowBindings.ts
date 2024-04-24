import type { onChange, CommonGetterParams } from './bindingTypes';

export const LightShadowBindings = (_params: CommonGetterParams) => ({
  mapSize: {
    label: 'MapSize',
    step: 1,
    // TODO: maybe get rid of __parent ?
    onChange: (({ bindings }) => {
      if (bindings.__parent?.shadow?.map) {
        bindings.__parent.shadow.map.dispose();
        bindings.__parent.shadow.map = null;
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

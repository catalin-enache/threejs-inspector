import { numberCommon } from './bindingHelpers';
import type { CommonGetterParams } from './bindingTypes';
import { LightShadowBindings } from './LightShadowBindings';

export const LightBindings = (params: CommonGetterParams) => ({
  intensity: {
    label: 'Intensity',
    min: 0,
    ...numberCommon
  },
  power: {
    label: 'Power',
    min: 0,
    ...numberCommon
  },
  color: {
    label: 'Color',
    color: { type: 'float' },
    view: 'color'
  },
  groundColor: {
    // for hemisphere light
    label: 'Ground Color',
    color: { type: 'float' },
    view: 'color'
  },
  decay: {
    label: 'Decay',
    min: 0,
    ...numberCommon
  },
  distance: {
    label: 'Distance',
    min: 0,
    ...numberCommon
  },
  angle: {
    label: 'Angle',
    min: 0,
    max: Math.PI / 2,
    ...numberCommon
  },
  penumbra: {
    // SpotLight
    label: 'Penumbra',
    min: 0,
    max: 1,
    ...numberCommon
  },
  width: {
    // RectAreaLight
    label: 'Width',
    ...numberCommon
  },
  height: {
    // RectAreaLight
    label: 'Height',
    ...numberCommon
  },
  shadow: {
    // Some lights have shadow
    title: 'Shadow',
    ...LightShadowBindings(params)
  },
  target: {
    // for DirectionalLight, SpotLight
    title: 'Target',
    position: {
      label: 'Position',
      ...numberCommon
    }
  }
});

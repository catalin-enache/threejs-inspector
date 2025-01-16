import { radToDegFormatter } from 'lib/utils';
import type { CommonGetterParams } from './bindingTypes';
import { TextureBindings } from './TextureBindings';
import { numberCommon } from './bindingHelpers';

export const SceneConfigBindings = (params: CommonGetterParams) => ({
  id: {
    label: 'ID',
    disabled: true,
    format: (value: number) => value.toFixed(0)
  },
  uuid: {
    label: 'UUID',
    view: 'text',
    disabled: true
  },
  name: {
    label: 'Name',
    view: 'text',
    disabled: true
  },
  type: {
    label: 'Type',
    view: 'text',
    disabled: true
  },
  environment: {
    label: 'Environment',
    color: { type: 'float' },
    gl: params.sceneObjects.gl,
    details: {
      ...TextureBindings(params)
    }
  },
  environmentIntensity: {
    label: 'ENV Intensity',
    ...numberCommon,
    min: 0
  },
  environmentRotation: {
    label: `ENV Rotation(${params.angleFormat})`,
    ...numberCommon,
    ...(params.angleFormat === 'deg' ? { format: radToDegFormatter } : {})
  },
  background: {
    label: 'Background',
    color: { type: 'float' },
    gl: params.sceneObjects.gl,
    details: {
      ...TextureBindings(params)
    }
  },
  backgroundBlurriness: {
    label: 'BG Blurriness',
    ...numberCommon,
    min: 0,
    max: 1
  },
  backgroundIntensity: {
    label: 'BG Intensity',
    ...numberCommon,
    min: 0
  },
  backgroundRotation: {
    label: `BG Rotation(${params.angleFormat})`,
    ...numberCommon,
    ...(params.angleFormat === 'deg' ? { format: radToDegFormatter } : {})
  },
  fog: {
    title: 'Fog',
    color: { label: 'Color', color: { type: 'float' }, view: 'color' },
    near: {
      label: 'Near',
      pointerScale: 0.1,
      step: 0.1
    },
    far: { label: 'Far', pointerScale: 0.1, step: 0.1 }
  }
});

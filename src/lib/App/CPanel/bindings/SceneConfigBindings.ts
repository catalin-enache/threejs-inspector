import { radToDegFormatter } from 'lib/utils';
import type { CommonGetterParams } from './bindingTypes';
import { TextureBindings } from './TextureBindings';
import { numberCommon } from './bindingHelpers';

export const SceneConfigBindings = (params: CommonGetterParams) => ({
  background: {
    label: 'Background',
    color: { type: 'float' },
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
  }
});

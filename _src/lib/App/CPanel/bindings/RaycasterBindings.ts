import { numberCommon } from './bindingHelpers';

export const RaycasterParamsLineBindings = () => ({
  threshold: {
    label: 'Threshold',
    ...numberCommon,
    min: 0
  }
});
export const RaycasterParamsPointsBindings = () => ({
  threshold: {
    label: 'Threshold',
    ...numberCommon,
    min: 0
  }
});

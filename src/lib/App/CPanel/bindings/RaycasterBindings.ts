import { numberCommon } from './bindingHelpers';
import type { CommonGetterParams } from './bindingTypes';

export const RaycasterParamsLineBindings = (_params: CommonGetterParams) => ({
  threshold: {
    label: 'Threshold',
    ...numberCommon,
    min: 0
  }
});
export const RaycasterParamsPointsBindings = (_params: CommonGetterParams) => ({
  threshold: {
    label: 'Threshold',
    ...numberCommon,
    min: 0
  }
});

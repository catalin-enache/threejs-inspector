import type { CustomControlProps } from 'components/CustomControl/CustomControl';

export interface CustomParamStruct {
  object?: CustomControlProps['object'];
  prop?: CustomControlProps['prop'];
  control: CustomControlProps['control'];
}

export const isCustomParamStruct = (value: any): value is CustomParamStruct => {
  return (
    value &&
    typeof value === 'object' &&
    value.control &&
    (value.control.readonly || // monitor
      typeof value.control.onChange === 'function' || // binding
      typeof value.control.onClick === 'function') // button
  );
};

export interface CustomParams {
  [key: string]: CustomParamStruct | CustomParams;
}

import { TypedArray } from 'three';

export const roundArray = (tArray: TypedArray | number[], fractionDigits: number = 1) => {
  return Array.from(tArray).map((v: number) => {
    let ret = +v.toFixed(fractionDigits);
    // eslint-disable-next-line no-compare-neg-zero
    if (ret === -0) {
      ret = 0;
    }
    return ret;
  });
};

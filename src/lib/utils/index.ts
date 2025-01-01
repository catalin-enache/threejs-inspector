import { isTextureImage, isValidTexture } from 'src/types';

export const isObject = (value: any) => {
  return (
    // value !== null && typeof value === 'object' && // compatible with Tweakpane if needed
    value && value.constructor === Object && !isArray(value) && !isTextureImage(value) && !isValidTexture(value)
  );
};

export const isArray = (value: any) => {
  return Array.isArray(value);
};
const scalingFactor = 100000;
// assuming left and right are the same type
const isEqualPrimitive = (left: any, right: any) => {
  if (typeof left === 'number') {
    const _left = Math.round(left * scalingFactor) / scalingFactor;
    const _right = Math.round(right * scalingFactor) / scalingFactor;
    return _left === _right;
  }
  return left === right;
};

// assuming left and right are the same type and one level deep object
export const isEqual = (left: any, right: any) => {
  // for primitives make a simple comparison
  if (!isObject(left) && !isArray(left)) return isEqualPrimitive(left, right);
  const keys = Object.keys(left);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (!isEqualPrimitive(left[key], right[key])) {
      return false;
    }
  }
  return true;
};

export const shallowClone = (value: any) => {
  if (isObject(value)) {
    return { ...value };
  } else if (isArray(value)) {
    return [...value];
  }
  return value;
};

export const degToRad = (deg: number) => {
  return (deg / 180) * Math.PI;
};

export const radToDegFormatter = (rad: number) => {
  return ((rad / Math.PI) * 180).toFixed(1);
};

export const FILE_UNKNOWN = 'unknown';

export const getFileType = (filename: string, fileTypeMap: Record<string, any>): string => {
  return fileTypeMap[filename.split('.').pop()?.toLowerCase() || ''] || FILE_UNKNOWN;
};

export const getNameAndType = (
  file: File | string,
  fileTypeMap: Record<string, any>
): { name: string; fileType: string } => {
  const isFileType = file instanceof File;
  const name = isFileType ? file.name : file;
  const fileType = getFileType(name, fileTypeMap);
  return { name, fileType };
};

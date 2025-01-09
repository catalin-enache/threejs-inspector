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

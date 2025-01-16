export const FILE_UNKNOWN = 'unknown';

export const getFileType = (filename: string, fileTypeMap: Record<string, any>): string => {
  return fileTypeMap[filename.split('.').pop()?.toLowerCase() || ''] || FILE_UNKNOWN;
};

export const getFileNameAndType = (
  file: File | string,
  fileTypeMap: Record<string, any>
): { name: string; fileType: string } => {
  const isFileType = file instanceof File;
  const name = isFileType ? file.name : file;
  const fileType = getFileType(name, fileTypeMap);
  return { name, fileType };
};

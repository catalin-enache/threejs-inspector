export const FILE_UNKNOWN = 'unknown';

export const getExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

export const getFileType = (filename: string, fileTypeMap: Record<string, any>): string => {
  const extension = getExtension(filename);
  return fileTypeMap[extension] || FILE_UNKNOWN;
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

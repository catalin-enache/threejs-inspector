export function createPlaceholderImage(): HTMLImageElement {
  const svg = `
	<svg width="320" height="50" xmlns="http://www.w3.org/2000/svg">
  <style>
    text {
      font-family: "Menlo", monospace;
      font-size: 12px;
			fill: gray;
    }
  </style>
  <text x="50%" y="55%" text-anchor="middle">
    No Image
  </text>
</svg>`;

  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const image = new Image();
  image.src = URL.createObjectURL(blob as Blob);
  return image;
}

export function loadImage(src: string): HTMLImageElement {
  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.src = src;
  // image.onload = () => {
  // };
  // image.onerror = reject;
  return image;
}

export function cloneImage(
  source: HTMLImageElement
): Promise<HTMLImageElement> {
  const canvas = document.createElement('canvas');
  canvas.width = source.width;
  canvas.height = source.height;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(source, 0, 0);

  const image = new Image();
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve(image);
        return;
      }
      image.src = URL.createObjectURL(blob);
      image.onload = () => {
        resolve(image);
      };
    });
  });
}

export const FILE_EXR = 'image/x-exr';
export const FILE_GIF = 'image/gif';
export const FILE_JPEG = 'image/jpeg';
export const FILE_PNG = 'image/png';
export const FILE_TIFF = 'image/tiff';
export const FILE_WEBP = 'image/webp';
export const FILE_UNKNOWN = 'unknown';

export const fileTypeMap: Record<string, string> = {
  jpg: FILE_JPEG,
  jpeg: FILE_JPEG,
  png: FILE_PNG,
  webp: FILE_WEBP,
  gif: FILE_GIF,
  tiff: FILE_TIFF,
  exr: FILE_EXR
};

export const getFileType = (filename: string): string => {
  return (
    fileTypeMap[filename.split('.').pop()?.toLowerCase() || ''] || FILE_UNKNOWN
  );
};

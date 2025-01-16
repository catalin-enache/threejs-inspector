import * as THREE from 'three';
import { TextureImage } from 'src/types';

export const isTextureImage = (obj: any): obj is TextureImage => {
  if (!obj) return false;
  return (
    (obj instanceof HTMLImageElement || obj.data instanceof Uint8Array || obj.data instanceof Uint16Array) &&
    typeof obj.width === 'number' &&
    typeof obj.height === 'number'
  );
};

export const isPVRCubeTexture = (obj: any) => {
  return obj instanceof THREE.CompressedTexture && Array.isArray(obj.image) && obj.image.length === 6;
};

export const isValidTexture = (obj: any): obj is THREE.Texture => {
  // ImageTexture or DataTexture or CubeTexture
  return (
    obj instanceof THREE.Texture &&
    (obj.image?.width ||
      (obj as THREE.CubeTexture).images?.[0]?.image?.width ||
      (obj as THREE.CubeTexture).images?.[0]?.width ||
      // .pvr is a container with image being a 6x1 cube texture
      isPVRCubeTexture(obj))
  );
};

function directionToCubeFaceUV(direction: [number, number, number]) {
  const abs = direction.map(Math.abs);
  let face, u, v;
  // comparing abs returns the dominant axis (the face), UV coords are determined from the remaining 2 axes
  if (abs[0] >= abs[1] && abs[0] >= abs[2]) {
    // +/- X face
    face = direction[0] > 0 ? 0 : 1; // +X or -X
    u = direction[0] > 0 ? direction[2] / abs[0] : -direction[2] / abs[0];
    v = -direction[1] / abs[0];
  } else if (abs[1] >= abs[0] && abs[1] >= abs[2]) {
    // +/- Y face
    face = direction[1] > 0 ? 2 : 3; // +Y or -Y
    u = direction[0] / abs[1];
    v = direction[1] > 0 ? -direction[2] / abs[1] : direction[2] / abs[1];
  } else {
    // +/- Z face
    face = direction[2] < 0 ? 4 : 5;
    u = direction[2] > 0 ? -direction[0] / abs[2] : direction[0] / abs[2];
    v = -direction[1] / abs[2];
  }

  // Convert UVs to [0, 1] range
  u = (u + 1) * 0.5;
  v = (v + 1) * 0.5;

  return { face, u, v };
}

function arrayToImageData(array: Uint8Array, width: number, height: number, ctx: CanvasRenderingContext2D) {
  const imageData = ctx.createImageData(width, height);
  imageData.data.set(array);
  return imageData;
}

export const getFallbackTexture = (width = 8, height = 8) => {
  const fallbackBuffer = new Uint8Array(4 * width * height);
  const fallbackTexture = new THREE.DataTexture(fallbackBuffer, width, height);
  fallbackTexture.needsUpdate = true;
  return { texture: fallbackTexture, buffer: fallbackBuffer };
};

export const extractTextureFromGPU = ({
  renderTarget,
  renderer,
  imgObj,
  i = 0
}: {
  renderTarget?: THREE.WebGLCubeRenderTarget | THREE.WebGLRenderTarget;
  renderer: THREE.WebGLRenderer;
  imgObj: { width: number; height: number; depth: number };
  i?: number;
}) => {
  const { texture: fallbackTexture, buffer: fallbackBuffer } = getFallbackTexture(imgObj.width, imgObj.height);

  if (!renderTarget) {
    console.error('No render target provided for imgObj', imgObj);
    return { texture: fallbackTexture, pixelBuffer: fallbackBuffer };
  }

  const width = renderTarget.width;
  const height = renderTarget.height;
  // const textureType = renderTarget.texture.type; // to pick the right buffer type
  // const textureFormat = renderTarget.texture.format; // to pick the right format
  // It seems WebGLCubeRenderTarget with type THREE.HalfFloatType cannot be read into any buffer type
  // For now hardcoding it to Uint8Array
  const pixelBuffer = new Uint8Array(width * height * 4); // RGBA (4 bytes per pixel) // Uint8Array Uint16Array

  try {
    renderer.readRenderTargetPixels(renderTarget, 0, 0, width, height, pixelBuffer, i);
    const texture = new THREE.DataTexture(pixelBuffer, width, height, THREE.RGBAFormat);
    texture.name = `ExtractedTexture_${i}`;
    return { texture, pixelBuffer };
  } catch (error) {
    console.error('Error extracting texture from GPU', error);
    return { texture: fallbackTexture, pixelBuffer: fallbackBuffer };
  }
};

export const extractCubeTextureFromGPU = ({
  renderTarget,
  renderer,
  images,
  layout = 'cross'
}: {
  renderTarget?: THREE.WebGLCubeRenderTarget | THREE.WebGLRenderTarget;
  renderer: THREE.WebGLRenderer;
  images: { width: number; height: number; depth: number }[];
  layout?: 'cross' | 'equirectangular';
}) => {
  if (!renderTarget) {
    console.error('No render target provided for images', images);
    return getFallbackTexture(images[0].width, images[0].height).texture;
  }

  const width = renderTarget.width;
  const height = renderTarget.height;
  const canvas = document.createElement('canvas');

  const faces = [];
  for (let i = 0; i < 6; i++) {
    const textureAndPixelBuffer = extractTextureFromGPU({
      renderTarget,
      renderer,
      imgObj: images[i],
      i
    });
    faces.push(textureAndPixelBuffer);
  }

  if (layout === 'cross') {
    canvas.width = width * 4;
    canvas.height = height * 3;
    const ctx = canvas.getContext('2d')!;
    // resulting in a 4x3 layout of the cube faces (a cross like image)
    const faceLayout = [
      // const [ cameraPX, cameraNX, cameraPY, cameraNY, cameraPZ, cameraNZ ] = cameras; // extracted from THREE
      { face: 0, x: 2 * width, y: height }, // +X (PX)
      { face: 1, x: 0, y: height }, // -X (NX)
      { face: 2, x: width, y: 0 }, // +Y (PY)
      { face: 3, x: width, y: 2 * height }, // -Y (NY)
      { face: 4, x: width, y: height }, // +Z (PZ)
      { face: 5, x: 3 * width, y: height } // -Z (NZ)
    ];

    for (const { face, x, y } of faceLayout) {
      const imageData = arrayToImageData(faces[face].pixelBuffer, width, height, ctx);
      ctx.putImageData(imageData, x, y);
    }
  } else {
    const faceWidth = faces[0].texture.image.width;
    const faceHeight = faces[0].texture.image.height;
    const equirectWidth = faceWidth * 4; // 4 faces wide
    const equirectHeight = faceHeight * 2; // 2 faces tall (180° latitude)
    canvas.width = equirectWidth;
    canvas.height = equirectHeight;
    const ctx = canvas.getContext('2d')!;

    const imageData = ctx.createImageData(equirectWidth, equirectHeight);

    // https://stackoverflow.com/questions/34250742/converting-a-cubemap-into-equirectangular-panorama

    for (let y = 0; y < equirectHeight; y++) {
      const latitude = ((y + 0.5) / equirectHeight) * Math.PI; // Latitude / theta
      for (let x = 0; x < equirectWidth; x++) {
        const longitude = ((x + 0.5) / equirectWidth) * 2 * Math.PI; // Longitude / phi

        // Compute 3D direction vector
        const direction: [number, number, number] = [
          Math.sin(latitude) * Math.sin(longitude), // X
          Math.cos(latitude), // Y
          Math.sin(latitude) * Math.cos(longitude) // Z
        ];

        // Map the direction to a cube face and UV
        const { face, u, v } = directionToCubeFaceUV(direction);

        // Calculate pixel coordinates on the cube face
        const faceX = Math.floor(u * faceWidth);
        const faceY = Math.floor(v * faceHeight);

        // Get the color from the cube face
        const faceImage = faces[face].pixelBuffer;
        const idx = (faceY * faceWidth + faceX) * 4; // RGBA index
        const r = faceImage[idx];
        const g = faceImage[idx + 1];
        const b = faceImage[idx + 2];
        const a = faceImage[idx + 3];

        // Write to the equirectangular texture
        const pixelIdx = (y * equirectWidth + x) * 4;
        imageData.data[pixelIdx] = r;
        imageData.data[pixelIdx + 1] = g;
        imageData.data[pixelIdx + 2] = b;
        imageData.data[pixelIdx + 3] = a;
      }
    }

    // Draw the equirectangular image to the canvas
    ctx.putImageData(imageData, 0, 0);
  }
  // Use the canvas as a background texture
  return new THREE.CanvasTexture(canvas);
};

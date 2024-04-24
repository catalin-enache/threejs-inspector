import * as THREE from 'three';

const cloneOldTextureWithNewImage = (
  source: THREE.Texture | THREE.CubeTexture | null,
  images: HTMLImageElement | HTMLImageElement[]
) => {
  if (!source) return null;
  const oldTexture = source.clone();
  const _images = Array.isArray(images) ? images : [images];
  if (_images.length === 0) return oldTexture;
  if (source instanceof THREE.CubeTexture && _images.length !== 6) {
    console.error(
      'cloneOldTextureWithNewImage: CubeTexture requires 6 images, but got',
      _images.length
    );
    return oldTexture;
  }
  const newTexture =
    source instanceof THREE.Texture
      ? new THREE.Texture(_images[0])
      : new THREE.CubeTexture(_images);
  newTexture.name = oldTexture.name;
  newTexture.channel = oldTexture.channel;
  newTexture.mapping = oldTexture.mapping;
  newTexture.wrapS = oldTexture.wrapS;
  newTexture.wrapT = oldTexture.wrapT;
  newTexture.flipY = oldTexture.flipY;
  newTexture.magFilter = oldTexture.magFilter;
  newTexture.minFilter = oldTexture.minFilter;
  newTexture.format = oldTexture.format;
  newTexture.type = oldTexture.type;
  newTexture.internalFormat = oldTexture.internalFormat;
  newTexture.anisotropy = oldTexture.anisotropy;
  newTexture.colorSpace = oldTexture.colorSpace;
  newTexture.offset.copy(oldTexture.offset);
  newTexture.repeat.copy(oldTexture.repeat);
  newTexture.center.copy(oldTexture.center);
  newTexture.rotation = oldTexture.rotation;
  newTexture.matrixAutoUpdate = oldTexture.matrixAutoUpdate;
  newTexture.generateMipmaps = oldTexture.generateMipmaps;
  newTexture.premultiplyAlpha = oldTexture.premultiplyAlpha;
  newTexture.onUpdate = oldTexture.onUpdate;
  newTexture.userData = oldTexture.userData;
  // newTexture.updateMatrix();
  newTexture.needsUpdate = true;
  return newTexture;
};

export default cloneOldTextureWithNewImage;

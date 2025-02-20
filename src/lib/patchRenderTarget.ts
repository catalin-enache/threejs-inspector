import * as THREE from 'three';
import type { RenderTargetAsJson } from 'tsExtensions';

THREE.RenderTarget.prototype.toJSON = (function () {
  return function (this: THREE.RenderTarget, meta?: THREE.JSONMeta): RenderTargetAsJson {
    const data: RenderTargetAsJson = {
      width: this.width,
      height: this.height,
      options: {
        wrapS: this.texture.wrapS,
        wrapT: this.texture.wrapT,
        magFilter: this.texture.magFilter,
        minFilter: this.texture.minFilter,
        generateMipmaps: this.texture.generateMipmaps,
        format: this.texture.format,
        type: this.texture.type,
        anisotropy: this.texture.anisotropy,
        colorSpace: this.texture.colorSpace,
        internalFormat: this.texture.internalFormat,
        depthBuffer: this.depthBuffer,
        stencilBuffer: this.stencilBuffer,
        resolveDepthBuffer: this.resolveDepthBuffer,
        resolveStencilBuffer: this.resolveStencilBuffer,
        depthTexture: this.depthTexture && {
          ...this.depthTexture.toJSON(meta),
          imageWidth: this.depthTexture.image.width,
          imageHeight: this.depthTexture.image.height
        },
        samples: this.samples,
        count: this instanceof THREE.WebGLCubeRenderTarget ? 1 : this.texture.image.length
      }
    };
    return data;
  };
})();

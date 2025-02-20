import * as THREE from 'three';
import { vi, expect, describe, it } from 'vitest';
import { withScene } from 'testutils/testScene';
import {
  ultraHdrLoader,
  rgbeLoader,
  textureLoader,
  ddsLoader,
  exrLoader,
  tgaLoader,
  tiffLoader,
  ktx2Loader,
  pvrLoader
} from 'lib/utils/loaders';

describe('image loaders', () => {
  it('load textures', { timeout: 5000 }, async () =>
    withScene({ sizeUnit: 10, useFloor: true })(async ({ scene }) => {
      const handleLoadingManagerOnStart = vi.fn((_event) => {
        // console.log('LoadingManager.onStart', _event);
      });
      const handleLoadingManagerOnLoad = vi.fn((_event) => {
        // console.log('TIFMK.LoadingManager.onLoad', _event);
      });

      window.addEventListener('TIFMK.LoadingManager.onStart', handleLoadingManagerOnStart);
      window.addEventListener('TIFMK.LoadingManager.onLoad', handleLoadingManagerOnLoad);

      const textures = await Promise.all([
        ultraHdrLoader.loadAsync('/textures/background/equirectangular/spruit_sunrise_4k.hdr.jpg'),
        rgbeLoader.loadAsync('/textures/background/equirectangular/moonless_golf_1k.hdr'),
        textureLoader.loadAsync('/textures/background/equirectangular/kandao3.jpg'),
        ddsLoader.loadAsync('/models/MyTests/with_non_native_textures/textures/sample_512.dds'),
        exrLoader.loadAsync('/models/MyTests/with_non_native_textures/textures/sample_512.exr'),
        ktx2Loader.loadAsync('/textures/compressed/2d_astc_6x6.ktx2'),
        pvrLoader.loadAsync('/textures/compressed/disturb_2bpp_rgb.pvr'),
        tgaLoader.loadAsync('/models/MyTests/with_non_native_textures/textures/sample_512.tga'),
        tiffLoader.loadAsync('/models/MyTests/with_non_native_textures/textures/sample_512.tiff')
      ]);

      textures.forEach((texture, idx) => {
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const geometry = new THREE.PlaneGeometry(10, 10);
        const plane = new THREE.Mesh(geometry, material);
        plane.position.set(0, 0, -5 * idx);
        scene.add(plane);
      });

      const [
        textureHdrJpg,
        textureHdr,
        textureJpg,
        textureDds,
        textureExr,
        textureKtx2,
        texturePvr,
        textureTga,
        textureTiff
      ] = textures;

      // console.log('textureHdrJpg', textureHdrJpg);
      // console.log('textureHdr', textureHdr);
      // console.log('textureJpg', textureJpg);
      // console.log('textureDds', textureDds);
      // console.log('textureExr', textureExr);
      // console.log('textureKtx2', textureKtx2);
      // console.log('texturePvr', texturePvr);
      // console.log('textureTga', textureTga);
      // console.log('textureTiff', textureTiff);

      expect(handleLoadingManagerOnStart).toHaveBeenCalledTimes(1);
      expect(handleLoadingManagerOnLoad).toHaveBeenCalledTimes(1);

      expect(textureHdrJpg).toBeInstanceOf(THREE.DataTexture);
      expect(textureHdrJpg.image.width).toBe(4096);
      expect(textureHdrJpg.image.height).toBe(2048);

      expect(textureHdr).toBeInstanceOf(THREE.DataTexture);
      expect(textureHdr.image.width).toBe(1024);
      expect(textureHdr.image.height).toBe(512);

      expect(textureJpg).toBeInstanceOf(THREE.Texture);
      expect(textureJpg.image.width).toBe(4880);
      expect(textureJpg.image.height).toBe(2440);

      expect(textureDds).toBeInstanceOf(THREE.CompressedTexture);
      expect(textureDds.image.width).toBe(512);
      expect(textureDds.image.height).toBe(512);

      expect(textureExr).toBeInstanceOf(THREE.DataTexture);
      expect(textureExr.image.width).toBe(512);
      expect(textureExr.image.height).toBe(512);

      expect(textureKtx2).toBeInstanceOf(THREE.CompressedTexture);
      expect(textureKtx2.image.width).toBe(512);
      expect(textureKtx2.image.height).toBe(512);

      expect(texturePvr).toBeInstanceOf(THREE.CompressedTexture);
      expect(texturePvr.image.width).toBe(256);
      expect(texturePvr.image.height).toBe(256);

      expect(textureTga).toBeInstanceOf(THREE.DataTexture);
      expect(textureTga.image.width).toBe(512);
      expect(textureTga.image.height).toBe(512);

      expect(textureTiff).toBeInstanceOf(THREE.DataTexture);
      expect(textureTiff.image.width).toBe(512);
      expect(textureTiff.image.height).toBe(512);

      // await new Promise((resolve) => setTimeout(resolve, 60000));
    })
  );
});

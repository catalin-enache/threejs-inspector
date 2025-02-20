import * as THREE from 'three';
import { expect, describe, it, vi } from 'vitest';
import { withScene } from 'testutils/testScene';
import { createTexturesFromImages, sortFiles } from 'lib/utils/loadTexture';

describe('loadTexture', () => {
  describe('createTexturesFromImages', () => {
    it('load cube textures from 6 images', { timeout: 65000 }, async () =>
      withScene({ sizeUnit: 10, useFloor: false })(async () => {
        const handleLoadingManagerOnStart = vi.fn((_event) => {
          console.log('LoadingManager.onStart', _event);
        });
        const handleLoadingManagerOnLoad = vi.fn((_event) => {
          console.log('TIFMK.LoadingManager.onLoad', _event);
        });

        window.addEventListener('TIFMK.LoadingManager.onStart', handleLoadingManagerOnStart);
        window.addEventListener('TIFMK.LoadingManager.onLoad', handleLoadingManagerOnLoad);

        const material = new THREE.MeshBasicMaterial();
        material.needsUpdate = false;

        expect(material.version).toBe(0);

        const path1 = '/textures/background/cube/Bridge2/';
        const paths1 = ['negx.jpg', 'negy.jpg', 'negz.jpg', 'posx.jpg', 'posy.jpg', 'posz.jpg'];
        const textures1Promise = createTexturesFromImages(paths1, { material, path: path1 });

        const path2 = '/textures/background/cube/MilkyWay/';
        // prettier-ignore
        const paths2 = ['dark-s_nx.jpg', 'dark-s_ny.jpg', 'dark-s_nz.jpg', 'dark-s_px.jpg', 'dark-s_px.jpg', 'dark-s_px.jpg'];
        const textures2Promise = createTexturesFromImages(paths2, { path: path2 });

        const path3 = '/textures/background/cube/pisaHDR/';
        const paths3 = ['px.hdr', 'nx.hdr', 'py.hdr', 'ny.hdr', 'pz.hdr', 'nz.hdr'];
        const textures3Promise = createTexturesFromImages(paths3, { path: path3 });

        const [texture1, texture2, texture3] = (
          await Promise.all([textures1Promise, textures2Promise, textures3Promise])
        ).map((texture) => texture[0]);

        // scene.background = texture1; // bridge
        // scene.background = texture2; // galaxy
        // scene.background = texture3; // pisa

        expect(texture1).toBeInstanceOf(THREE.CubeTexture);
        expect(texture1.mapping).toEqual(THREE.CubeReflectionMapping);
        expect(texture1.source.data[0].src.endsWith(path1 + 'posx.jpg')).toBe(true);

        expect(texture2).toBeInstanceOf(THREE.CubeTexture);
        expect(texture2.mapping).toEqual(THREE.CubeReflectionMapping);
        expect(texture2.source.data[0].src.endsWith(path2 + 'dark-s_px.jpg')).toBe(true);

        expect(texture3).toBeInstanceOf(THREE.CubeTexture);
        expect(texture3.mapping).toEqual(THREE.CubeReflectionMapping);
        expect(texture3.source.data[0]).toBeInstanceOf(THREE.DataTexture);

        // checking this after at least one await since needsUpdate = true is done async (next frame)
        // in createTexturesFromImages
        expect(material.version).toBe(1);

        expect(handleLoadingManagerOnStart).toHaveBeenCalledTimes(1);
        expect(handleLoadingManagerOnLoad).toHaveBeenCalledTimes(1);

        // await new Promise((resolve) => setTimeout(resolve, 60000));
      })
    );
  });

  describe('sortFiles', () => {
    it('sorts files', () => {
      const unsorted1 = ['negx.jpg', 'negz.jpg', 'posx.jpg', 'negy.jpg', 'posy.jpg', 'posz.jpg'];
      const unsorted2 = ['negy.jpg', 'negz.jpg', 'posy.jpg', 'negx.jpg', 'posz.jpg', 'posx.jpg'];
      const unsorted3 = ['negz.jpg', 'negy.jpg', 'posz.jpg', 'negx.jpg', 'posy.jpg', 'posx.jpg'];
      const unsorted4 = ['posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg'];
      const sorted1 = ['posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg'];
      expect(sortFiles(unsorted1)).toEqual(sorted1);
      expect(sortFiles(unsorted2)).toEqual(sorted1);
      expect(sortFiles(unsorted3)).toEqual(sorted1);
      expect(sortFiles(unsorted4)).toEqual(sorted1);

      const unsorted5 = ['nx.jpg', 'nz.jpg', 'px.jpg', 'ny.jpg', 'py.jpg', 'pz.jpg'];
      const unsorted6 = ['ny.jpg', 'nz.jpg', 'py.jpg', 'nx.jpg', 'pz.jpg', 'px.jpg'];
      const unsorted7 = ['nz.jpg', 'ny.jpg', 'pz.jpg', 'nx.jpg', 'py.jpg', 'px.jpg'];
      const unsorted8 = ['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg'];
      const sorted2 = ['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg'];

      expect(sortFiles(unsorted5)).toEqual(sorted2);
      expect(sortFiles(unsorted6)).toEqual(sorted2);
      expect(sortFiles(unsorted7)).toEqual(sorted2);
      expect(sortFiles(unsorted8)).toEqual(sorted2);
    });
  });
});

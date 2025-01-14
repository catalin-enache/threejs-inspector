import * as THREE from 'three';
import { expect, describe, it } from 'vitest';
import { withScene } from 'testutils/testScene';
import { createTexturesFromImages } from 'lib/utils/loadTexture';

describe('createTexturesFromImages', () => {
  it('load cube textures from 6 images', { timeout: 5000 }, async () =>
    withScene({ sizeUnit: 10, useFloor: false })(async ({ scene }) => {
      const material = new THREE.MeshBasicMaterial();
      material.needsUpdate = false;

      expect(material.version).toBe(0);

      const path1 = '/textures/background/cube/Bridge2/';
      const paths1 = ['negx.jpg', 'negy.jpg', 'negz.jpg', 'posx.jpg', 'posy.jpg', 'posz.jpg'].map((p) => path1 + p);
      const textures1 = await createTexturesFromImages(paths1, { material });
      const texture1 = textures1[0];
      scene.background = texture1;

      expect(textures1.length).toBe(1);
      expect(texture1).toBeInstanceOf(THREE.CubeTexture);
      expect(texture1.mapping).toEqual(THREE.CubeReflectionMapping);

      const path2 = '/textures/background/cube/MilkyWay/';
      const paths2 = [
        'dark-s_nx.jpg',
        'dark-s_ny.jpg',
        'dark-s_nz.jpg',
        'dark-s_px.jpg',
        'dark-s_px.jpg',
        'dark-s_px.jpg'
      ].map((p) => path2 + p);
      const textures2 = await createTexturesFromImages(paths2, {});
      const texture2 = textures2[0];
      scene.background = texture2;

      expect(textures2.length).toBe(1);
      expect(texture2).toBeInstanceOf(THREE.CubeTexture);
      expect(texture2.mapping).toEqual(THREE.CubeReflectionMapping);

      const path3 = '/textures/background/cube/pisaHDR/';
      const paths3 = ['px.hdr', 'nx.hdr', 'py.hdr', 'ny.hdr', 'pz.hdr', 'nz.hdr'].map((p) => path3 + p);
      const textures3 = await createTexturesFromImages(paths3, {});
      const texture3 = textures3[0];
      scene.background = texture3;

      expect(textures3.length).toBe(1);
      expect(texture3).toBeInstanceOf(THREE.CubeTexture);
      expect(texture3.mapping).toEqual(THREE.CubeReflectionMapping);

      // checking this after at least one await since needsUpdate = true is done async (next frame)
      // in createTexturesFromImages
      expect(material.version).toBe(1);

      await new Promise((resolve) => setTimeout(resolve, 60000));
    })
  );
});

import * as THREE from 'three';
import { expect, describe, it } from 'vitest';
import { withScene } from 'testutils/testScene';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

describe('FBXLoader', () => {
  it('geometry.attributes.position.count === geometry.morphAttributes.position[0].count', () =>
    new Promise<void>((done, rej) => {
      withScene(
        0,
        false
      )(async ({ scene }) => {
        const fbxLoader = new FBXLoader();
        fbxLoader.load(
          '/models/MyTests/morph_test/morph_test.fbx',
          (fbx) => {
            scene.add(fbx);
            const mesh = fbx.children[0] as THREE.Mesh;
            const baseGeometryLength = mesh.geometry.attributes.position.count;
            const morphAttributesLength = mesh.geometry.morphAttributes.position[0].count;
            expect(baseGeometryLength).to.equal(morphAttributesLength);
            done();
          },
          undefined,
          rej
        );
      });
    }));
});

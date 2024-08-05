import * as THREE from 'three';
import { expect, describe, it } from 'vitest';
import { withScene } from 'testutils/testScene';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

describe('FBXLoader', () => {
  it('geometry.attributes.position.count === geometry.morphAttributes.position[0].count', () =>
    new Promise<void>((done, rej) => {
      const fbxLoader = new FBXLoader();
      let baseGeometryLength, morphAttributesLength;
      fbxLoader.load(
        '/models/MyTests/morph_test/morph_test.fbx',
        (fbx) => {
          const mesh = fbx.children[0] as THREE.Mesh;
          console.log('mesh', mesh);
          mesh.castShadow = true;
          withScene(0)(({ scene }) => {
            baseGeometryLength = mesh.geometry.attributes.position.count;
            morphAttributesLength = mesh.geometry.morphAttributes.position[0].count;
            expect(baseGeometryLength).to.equal(morphAttributesLength);
            scene.add(fbx);
            return () => {
              done();
              scene.remove(fbx);
            };
          });
        },
        () => {},
        () => {
          rej();
        }
      );
    }));
});

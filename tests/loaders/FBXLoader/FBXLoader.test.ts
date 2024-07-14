import THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { expect } from '@esm-bundle/chai';
// import { getScene } from '../../testutils/getScene';

const sum = (a: number, b: number) => a + b;

describe('sum', () => {
  it('sums up 2 numbers', () => {
    // console.log({ window });
    const img = document.createElement('img');
    img.src = '/public/textures/background/2d/cover-1920.jpg';
    document.body.appendChild(img);
    expect(sum(1, 1)).to.equal(2);
    expect(sum(3, 12)).to.equal(15);
  });
});

describe('fbx', () => {
  it('loads', (done) => {
    const fbxLoader = new FBXLoader();
    fbxLoader.load('/public/models/MyTests/morph_test/morph_test.fbx', (fbx) => {
      const mesh = fbx.children[0] as THREE.Mesh;
      // const scene = getScene();
      // console.log({ scene });
      // getScene().scene.add(fbx);
      const baseGeometryLength = mesh.geometry.attributes.position.count;
      const morphAttributesLength = mesh.geometry.morphAttributes.position[0].count;
      expect(baseGeometryLength).to.equal(morphAttributesLength);
      done();
      // getScene().scene.remove(fbx);
    });
  });
});

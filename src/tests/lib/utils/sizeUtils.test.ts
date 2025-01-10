import * as THREE from 'three';
import { expect, describe, it } from 'vitest';

import { getSceneBoundingBoxSize } from 'lib/utils/sizeUtils';
import { withScene } from 'testutils/testScene';

describe('getSceneBoundingBoxSize', () => {
  it(
    'returns the size of the bounding box of all objects in the scene when useFrustum is false else the size of the bounding box of all objects in the scene that are in the camera frustum',
    { timeout: 1000 },
    async () =>
      new Promise<void>((done) => {
        const sizeUnit = 10;
        withScene({ sizeUnit, useFloor: false })(async ({ scene, camera, controls }) => {
          controls.enableDamping = false;
          camera.position.set(sizeUnit, sizeUnit * 2, sizeUnit * 3);
          controls.target.set(0, sizeUnit, 0);
          controls.update();

          const geometry = new THREE.BoxGeometry(2, 2, 2);
          const cube1 = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0x00ff00 }));
          cube1.position.set(5, 0, 0);
          scene.add(cube1);

          expect(getSceneBoundingBoxSize(scene, camera)).toEqual(new THREE.Vector3(2, 2, 2));

          const cube2 = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0xff0000 }));
          cube2.position.set(-5, 0, 0);
          scene.add(cube2);

          expect(getSceneBoundingBoxSize(scene, camera)).toEqual(new THREE.Vector3(12, 2, 2));

          const cube3 = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0x0000ff }));
          cube3.position.set(0, 5, 0);
          scene.add(cube3);

          expect(getSceneBoundingBoxSize(scene, camera)).toEqual(new THREE.Vector3(12, 7, 2));

          const cube4 = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0x00ffff }));
          cube4.position.set(0, -5, 0);
          scene.add(cube4);

          expect(getSceneBoundingBoxSize(scene, camera)).toEqual(new THREE.Vector3(12, 12, 2));

          const cube5 = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0xffff00 }));
          cube5.position.set(0, 0, 5);
          scene.add(cube5);

          expect(getSceneBoundingBoxSize(scene, camera)).toEqual(new THREE.Vector3(12, 12, 7));

          const cube6 = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0x000000 }));
          cube6.position.set(0, 0, -5);
          scene.add(cube6);

          expect(getSceneBoundingBoxSize(scene, camera)).toEqual(new THREE.Vector3(12, 12, 12));

          const cube7 = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0xeeeeee }));
          cube7.position.set(0, 0, 0);
          scene.add(cube7);

          expect(getSceneBoundingBoxSize(scene, camera)).toEqual(new THREE.Vector3(12, 12, 12));

          scene.remove(cube7);

          camera.position.set(0, 0, 0);
          camera.lookAt(0, 0, 0);
          camera.updateProjectionMatrix();

          expect(getSceneBoundingBoxSize(scene, camera, undefined, true)).toEqual(new THREE.Vector3(2, 2, 2));

          camera.position.set(0, -8, 0);
          camera.rotation.set(1, 0, 0);
          camera.updateProjectionMatrix();

          expect(getSceneBoundingBoxSize(scene, camera, undefined, true)).toEqual(new THREE.Vector3(2, 7, 7));

          camera.position.set(0, -8, 0);
          camera.rotation.set(1, 0.3, 0);
          camera.updateProjectionMatrix();

          expect(getSceneBoundingBoxSize(scene, camera, undefined, true)).toEqual(new THREE.Vector3(7, 7, 7));

          // await new Promise((resolve) => setTimeout(resolve, 60000));

          done();
        });
      })
  );
});

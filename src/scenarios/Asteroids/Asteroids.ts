import * as THREE from 'three';
import type { Config } from 'src/config';
import type { SceneObjects } from 'src/scene';
import { Vector3 } from 'three';
import { UserData } from 'src/types.ts';

export const setConfig = (config: Config) => {
  config.cameraType = 'perspective';
  config.orthographicCameraRatio = 100;
  config.controlPanelExpanded = true;
  return config;
};

export default (sceneObjects: SceneObjects) => {
  const {
    scene,
    // getTransformControls,
    loop,
    // pointer,
    // sceneSize,
    // getCamera,
    // getHit,
    // addCustomControl,
    changeScreenInfoValue,
    addScreenInfo,
    // changeCustomControlValue,
    // getClock,
    getDelta
    // getInteractiveObjects
  } = sceneObjects;

  const count = 100;
  const registry: Record<
    string,
    { cube: THREE.Object3D; direction: THREE.Vector3 }
  > = {};
  for (let i = 0; i < count; i++) {
    const cube = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    cube.name = `cube${i}`;
    cube.position.set(Math.random(), Math.random(), Math.random());
    (cube.userData as UserData).isInteractive = true;
    scene.add(cube);
    const direction = new Vector3(Math.random(), Math.random(), Math.random());
    addScreenInfo({
      linkObject: cube,
      name: `Cube${i}`,
      value: '?',
      position: { x: 0, y: 0 },
      // size: { width: 0, height: 0 },
      color: { bg: 'rgba(0,0,0,0.5)', fg: 'white' }
    });
    registry[`cube${i}`] = { cube, direction };
  }

  const tick = () => {
    const delta = getDelta();
    for (let i = 0; i < count; i++) {
      // const cube = scene.getObjectByName(`cube${i}`);
      const cube = registry[`cube${i}`].cube;
      const direction = registry[`cube${i}`].direction;
      if (cube) {
        cube.position.x += direction.x * delta;
        cube.position.y += direction.y * delta;
        cube.position.z += direction.z * delta;
        cube.rotation.x += direction.x * delta;
        cube.rotation.y += direction.y * delta;
        cube.rotation.z += direction.z * delta;
        changeScreenInfoValue(`Cube${i}`, `${cube.position.x.toFixed(2)}`);
      }
    }
  };
  loop(tick);
};

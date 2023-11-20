import * as THREE from 'three';
import type { Config } from 'src/config';
import type { SceneObjects } from 'src/scene';
import {
  // CUSTOM_CONTROL_EVENT_TYPE,
  EVENT_TYPE,
  // SCREEN_INFO_EVENT_TYPE,
  STANDARD_CONTROL_EVENT_TYPE,
  THREE_EVENT_TYPE
} from 'src/constants';
import type { CustomInfoControl } from 'src/types';

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
    sceneSize,
    getCamera,
    // getHit,
    addCustomControl,
    changeCustomControlValue,
    addScreenInfo,
    changeScreenInfoValue,
    // getClock,
    // getDelta,
    getInteractiveObjects
  } = sceneObjects;

  window.addEventListener(EVENT_TYPE.THREE, (evt: any) => {
    if (evt.detail.type === THREE_EVENT_TYPE.SELECTED_OBJECT_TRANSFORM) {
      handleSelectedObjectTransform(EVENT_TYPE.THREE, evt.detail.value);
    }
  });

  window.addEventListener(EVENT_TYPE.STANDARD_CONTROL, (evt: any) => {
    if (
      evt.detail.type === STANDARD_CONTROL_EVENT_TYPE.SELECTED_OBJECT_TRANSFORM
    ) {
      handleSelectedObjectTransform(
        EVENT_TYPE.STANDARD_CONTROL,
        evt.detail.value
      );
    }
  });

  function handleSelectedObjectTransform(
    _evtType: EVENT_TYPE,
    _object: THREE.Object3D
  ) {
    // console.log(_evtType, 'position', _object.position);
    // console.log(_evtType, 'rotation', _object.rotation);
    // console.log(_evtType, 'scale', _object.scale);
  }

  addCustomControl<CustomInfoControl>({
    type: 'info',
    name: 'cube1',
    label: 'Cube1',
    value: ''
  });

  addCustomControl<CustomInfoControl>({
    type: 'info',
    name: 'cube2',
    label: 'Cube2',
    value: ''
  });

  const cube1 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
  );
  cube1.name = 'cube1';
  cube1.position.set(0, 0, 0);
  getInteractiveObjects().push(cube1);
  scene.add(cube1);

  const cube2 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  );
  cube2.name = 'cube2';
  cube2.position.set(-2, 0, 0);
  getInteractiveObjects().push(cube2);
  scene.add(cube2);

  addScreenInfo({
    linkObject: cube1,
    name: 'Cube1_Coords2D',
    value: '?',
    position: { x: 0, y: 0 },
    size: { width: 40, height: 40 },
    color: { bg: 'rgba(0,0,0,.5)', fg: 'white' }
  });

  addScreenInfo({
    linkObject: cube2,
    name: 'Cube2_Coords2D',
    value: '?',
    position: { x: 0, y: 0 },
    size: { width: 40, height: 40 },
    color: { bg: 'rgba(0,0,0,.5)', fg: 'white' }
  });

  const getCoords2d = (object: THREE.Object3D) => {
    const vector = new THREE.Vector3();
    const camera = getCamera();
    const widthHalf = 0.5 * sceneSize.width;
    const heightHalf = 0.5 * sceneSize.height;

    // cube1.updateMatrixWorld();
    // camera.updateMatrixWorld();
    // Get the position of the center of the object in world space
    vector.setFromMatrixPosition(object.matrixWorld);

    // Project the 3D position vector onto the 2D screen using the camera
    vector.project(camera);
    // const x = (vector.x * 0.5 + 0.5) * sceneSize.width;
    // const y = (vector.y * -0.5 + 0.5) * sceneSize.height;
    // const x = vector.x;
    // const y = vector.y;

    const x = widthHalf + vector.x * widthHalf; // good
    const y = heightHalf - vector.y * heightHalf; // good

    // const x = (vector.x * 0.5 + 0.5) * sceneSize.width; // good
    // const y = (vector.y * -0.5 + 0.5) * sceneSize.height; // good
    // console.log(x, y);

    const roundedX = x.toFixed(2);
    const roundedY = y.toFixed(2);

    return { x: roundedX, y: roundedY };
  };

  const tick = () => {
    if (cube1.position.x > 2) {
      cube1.position.x = 0;
    }
    if (cube2.position.y > 2) {
      cube2.position.y = 0;
    }
    cube1.position.x += 0.001;
    cube2.position.y += 0.001;
    const cube1_pos = getCoords2d(cube1);
    const cube2_pos = getCoords2d(cube2);
    changeCustomControlValue('cube1', `${cube1_pos.x}, ${cube1_pos.y}`);
    changeCustomControlValue('cube2', `${cube2_pos.x}, ${cube2_pos.y}`);
    changeScreenInfoValue('Cube1_Coords2D', `${cube1_pos.x}\n${cube1_pos.y}`);
    changeScreenInfoValue('Cube2_Coords2D', `${cube2_pos.x}\n${cube2_pos.y}`);
  };
  loop(tick);
};

import * as THREE from 'three';
import type { Config } from 'src/config';
import type { SceneObjects } from 'src/scene';
import {
  // CUSTOM_CONTROL_EVENT_TYPE,
  EVENT_TYPE,
  STANDARD_CONTROL_EVENT_TYPE,
  THREE_EVENT_TYPE
} from 'src/constants';
// import type { CustomInfoControl } from 'src/types';
// import { Line } from 'lib/three/Line';
import { UserData } from 'src/types';

export const setConfig = (config: Config) => {
  config.cameraType = 'orthographic';
  config.orthographicCameraRatio = 100;
  config.controlPanelExpanded = false;
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
    // changeCustomControlValue,
    addScreenInfo,
    changeScreenInfoValue
    // getClock,
    // getDelta,
    // getInteractiveObjects
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

  const cubeSize = 1;

  const cube1 = new THREE.Mesh(
    new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize),
    new THREE.MeshBasicMaterial({ color: 0xcc0000 })
  );
  cube1.name = 'cube1';
  cube1.position.set(0, 0, 0);
  (cube1.userData as UserData).isInteractive = true;
  scene.add(cube1);

  const cube2 = new THREE.Mesh(
    new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize),
    new THREE.MeshBasicMaterial({ color: 0x00cc00 })
  );
  cube2.name = 'cube2';
  cube2.position.set(4, 0, 0);
  (cube2.userData as UserData).isInteractive = true;
  (cube2.userData as UserData).lineTo = {
    object: cube1,
    color: 0xffff00
  };
  scene.add(cube2);

  const cube3 = new THREE.Mesh(
    new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize),
    new THREE.MeshBasicMaterial({ color: 0x0000cc })
  );
  cube3.name = 'cube3';
  cube3.position.set(0, 4, 0);
  (cube3.userData as UserData).isInteractive = true;
  (cube3.userData as UserData).lineTo = {
    object: cube1,
    color: 0xffff00
  };
  scene.add(cube3);

  addScreenInfo({
    linkObject: cube1,
    name: 'Cube1',
    value: '?',
    position: { x: 0, y: 0 },
    // size: { width: 40, height: 40 },
    color: { bg: 'rgba(0,0,0,0)', fg: 'white' }
  });

  addScreenInfo({
    linkObject: cube2,
    name: 'Cube2',
    value: '?',
    position: { x: 0, y: 0 },
    // size: { width: 40, height: 40 },
    color: { bg: 'rgba(0,0,0,0)', fg: 'white' }
  });

  addScreenInfo({
    linkObject: cube3,
    name: 'Cube3',
    value: '?',
    position: { x: 0, y: 0 },
    // size: { width: 40, height: 40 },
    color: { bg: 'rgba(0,0,0,0)', fg: 'white' }
  });

  const tick = () => {
    changeScreenInfoValue('Cube1', Math.random().toFixed(2));
    changeScreenInfoValue('Cube2', Math.random().toFixed(2));
    changeScreenInfoValue('Cube3', Math.random().toFixed(2));
  };
  loop(tick);
};

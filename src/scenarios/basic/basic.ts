/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as THREE from 'three';
import type { Config } from 'src/config';
import type { SceneObjects } from 'src/scene';
import {
  EVENT_TYPE,
  THREE_EVENT_TYPE,
  STANDARD_CONTROL_EVENT_TYPE,
  CUSTOM_CONTROL_EVENT_TYPE
} from 'src/constants';

export const setConfig = (config: Config) => {
  config.cameraType = 'orthographic';
  config.orthographicCameraRatio = 400;
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
    addCustomControl,
    // changeCustomControlValue,
    getClock,
    getInteractiveObjects
  } = sceneObjects;

  window.addEventListener(EVENT_TYPE.THREE, (evt: any) => {
    if (evt.detail.type === THREE_EVENT_TYPE.SCENE_RESIZE) {
      // console.log(evt.detail.type, evt.detail.object);
    }
  });

  window.addEventListener(EVENT_TYPE.THREE, (evt: any) => {
    if (evt.detail.type === THREE_EVENT_TYPE.POINTER_DOWN) {
      // console.log(evt.detail.type, evt.detail.object);
    }
  });

  window.addEventListener(EVENT_TYPE.THREE, (evt: any) => {
    if (evt.detail.type === THREE_EVENT_TYPE.POINTER_UP) {
      // console.log(evt.detail.type, evt.detail.object);
    }
  });

  window.addEventListener(EVENT_TYPE.THREE, (evt: any) => {
    if (evt.detail.type === THREE_EVENT_TYPE.POINTER_CLICK) {
      // console.log(evt.detail.type, evt.detail.object);
    }
  });

  window.addEventListener(EVENT_TYPE.THREE, (evt: any) => {
    if (evt.detail.type === THREE_EVENT_TYPE.POINTER_MOVE) {
      // console.log(evt.detail.type, evt.detail.object);
      // console.log(getHit());
    }
  });

  window.addEventListener(EVENT_TYPE.THREE, (evt: any) => {
    if (evt.detail.type === THREE_EVENT_TYPE.OBJECT_HIT) {
      // console.log(evt.detail.type, evt.detail.object);
    }
  });

  window.addEventListener(EVENT_TYPE.THREE, (evt: any) => {
    if (evt.detail.type === THREE_EVENT_TYPE.OBJECT_SELECTED) {
      // console.log(evt.detail.type, evt.detail.object);
    }
  });

  window.addEventListener(EVENT_TYPE.THREE, (evt: any) => {
    if (evt.detail.type === THREE_EVENT_TYPE.SELECTED_OBJECT_TRANSFORM) {
      handleSelectedObjectTransform(EVENT_TYPE.THREE, evt.detail.object);
    }
  });

  window.addEventListener(EVENT_TYPE.STANDARD_CONTROL, (evt: any) => {
    if (
      evt.detail.type === STANDARD_CONTROL_EVENT_TYPE.SELECTED_OBJECT_TRANSFORM
    ) {
      handleSelectedObjectTransform(
        EVENT_TYPE.STANDARD_CONTROL,
        evt.detail.object
      );
    }
  });

  // The order this is fired is Scene, Scenario, ControlPanel
  // in the same order as ScenarioSelect initializes the scenario
  // @ts-ignore
  window.addEventListener(EVENT_TYPE.CUSTOM_CONTROL, (evt: CustomEvent) => {
    if (evt.detail.type === CUSTOM_CONTROL_EVENT_TYPE.VALUE_CHANGED) {
      // console.log(evt.detail.type, evt.detail.name, evt.detail.value);
    }
  });

  // @ts-ignore
  function handleSelectedObjectTransform(
    _evtType: EVENT_TYPE,
    _object: THREE.Object3D
  ) {
    // console.log(_evtType, 'position', _object.position);
    // console.log(_evtType, 'rotation', _object.rotation);
    // console.log(_evtType, 'scale', _object.scale);
  }

  addCustomControl({
    type: 'float',
    name: 'C1',
    label: 'C1L',
    value: 0.5,
    min: 0,
    max: 1
  });
  addCustomControl({
    type: 'float',
    name: 'C2',
    label: 'C2L',
    value: 0.6,
    min: 0,
    max: 2
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
  cube2.position.set(2, 0, 0);
  getInteractiveObjects().push(cube2);
  cube1.add(cube2);

  const tick = () => {
    const delta = getClock().getDelta();
    cube1.rotation.x += 0.5 * delta;
    cube2.rotation.y += 0.5 * delta;
    // changeCustomControlValue('C1', Math.random());
    // console.log(pointer);
    // console.log(getHit())
    // console.log(getCamera().position.length(), getCamera().zoom);
  };
  loop(tick);
};

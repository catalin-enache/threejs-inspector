/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as THREE from 'three';
import type { Config } from '../../config';
import {
  EVENT_TYPE,
  THREE_EVENT_TYPE,
  CONTROL_EVENT_TYPE
} from '../../constants';
import { init } from '../../scene';

export default (config: Config) => {
  // config.cameraType = 'orthographic';
  config.orthographicCameraRatio = 400;

  const {
    scene,
    // getTransformControls,
    loop,
    // pointer,
    // sceneSize,
    // getCamera,
    // getHit,
    getInteractiveObjects
  } = init(config);

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
    if (evt.detail.type === THREE_EVENT_TYPE.OBJECT_TRANSFORM) {
      handleObjectTransform(EVENT_TYPE.THREE, evt.detail.object);
    }
  });

  window.addEventListener(EVENT_TYPE.CONTROL, (evt: any) => {
    if (evt.detail.type === CONTROL_EVENT_TYPE.OBJECT_TRANSFORM) {
      handleObjectTransform(EVENT_TYPE.CONTROL, evt.detail.object);
    }
  });

  // @ts-ignore
  function handleObjectTransform(evtType: EVENT_TYPE, object: THREE.Object3D) {
    // console.log(evtType, object.position);
  }

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
    // console.log(pointer);
    // console.log(getHit())
    // console.log(getCamera().position.length(), getCamera().zoom);
  };
  loop(tick);
};

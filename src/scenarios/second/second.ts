/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as THREE from 'three';
import type { Config } from 'src/config';
import type { SceneObjects } from 'src/scene';
import {
  EVENT_TYPE,
  THREE_EVENT_TYPE,
  STANDARD_CONTROL_EVENT_TYPE
} from 'src/constants';

export const setConfig = (config: Config) => {
  config.cameraType = 'perspective';
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
      handleObjectTransform(EVENT_TYPE.THREE, evt.detail.object);
    }
  });

  window.addEventListener(EVENT_TYPE.STANDARD_CONTROL, (evt: any) => {
    if (
      evt.detail.type === STANDARD_CONTROL_EVENT_TYPE.SELECTED_OBJECT_TRANSFORM
    ) {
      handleObjectTransform(EVENT_TYPE.STANDARD_CONTROL, evt.detail.object);
    }
  });

  // @ts-ignore
  function handleObjectTransform(evtType: EVENT_TYPE, object: THREE.Object3D) {
    // console.log(evtType, 'position', object.position);
    // console.log(evtType, 'rotation', object.rotation);
    // console.log(evtType, 'scale', object.scale);
  }

  const cube1 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
  );
  cube1.name = 'cube3';
  cube1.position.set(0, 0, 0);
  getInteractiveObjects().push(cube1);
  scene.add(cube1);

  const tick = () => {
    const delta = getClock().getDelta();
    cube1.rotation.x += 0.5 * delta;
    // console.log(pointer);
    // console.log(getHit())
    // console.log(getCamera().position.length(), getCamera().zoom);
  };
  loop(tick);
};

import * as THREE from 'three';
import type { Config } from 'old_src/config';
import type { SceneObjects } from 'old_src/scene';
import {
  EVENT_TYPE,
  THREE_EVENT_TYPE,
  STANDARD_CONTROL_EVENT_TYPE,
  CUSTOM_CONTROL_EVENT_TYPE
} from 'old_src/constants';
import type {
  CustomBooleanControl,
  CustomButtonControl,
  CustomFloatControl,
  CustomInfoControl,
  CustomIntegerControl,
  CustomSelectControl,
  UserData
} from 'old_src/types';
import { Line } from 'lib/three/Line';

export const setConfig = (config: Config) => {
  config.cameraType = 'perspective';
  config.orthographicCameraRatio = 100;
  config.controlPanelExpanded = true;
  config.showScenarioSelect = true;
  config.objectsToCheckIfVisibleInCamera = 'screenInfo';
  config.checkVisibleInFrustumUsing = 'position';
  return config;
};

export default (sceneObjects: SceneObjects) => {
  const {
    scene,
    // getTransformControls,
    loop,
    pointer,
    // sceneSize,
    getCamera,
    getHit,
    addCustomControl,
    changeScreenInfoValue,
    addScreenInfo,
    changeCustomControlValue,
    // getClock,
    getDelta
    // getInteractiveObjects
  } = sceneObjects;

  window.addEventListener(EVENT_TYPE.THREE, (evt: any) => {
    if (evt.detail.type === THREE_EVENT_TYPE.SCENE_RESIZE) {
      // console.log(evt.detail.type, evt.detail.value);
    }
  });

  window.addEventListener(EVENT_TYPE.THREE, (evt: any) => {
    if (evt.detail.type === THREE_EVENT_TYPE.POINTER_DOWN) {
      // console.log(evt.detail.type, evt.detail.value);
    }
  });

  window.addEventListener(EVENT_TYPE.THREE, (evt: any) => {
    if (evt.detail.type === THREE_EVENT_TYPE.POINTER_UP) {
      // console.log(evt.detail.type, evt.detail.value);
    }
  });

  window.addEventListener(EVENT_TYPE.THREE, (evt: any) => {
    if (evt.detail.type === THREE_EVENT_TYPE.POINTER_CLICK) {
      // console.log(evt.detail.type, evt.detail.value);
    }
  });

  window.addEventListener(EVENT_TYPE.THREE, (evt: any) => {
    if (evt.detail.type === THREE_EVENT_TYPE.POINTER_MOVE) {
      // console.log(evt.detail.type, evt.detail.value);
      // console.log(getHit());
      changeCustomControlValue(
        'Pointer',
        `${pointer.x.toFixed(2)} ${pointer.y.toFixed(2)}`
      );
      changeScreenInfoValue(
        'Cursor',
        `${pointer.x.toFixed(2)} ${pointer.y.toFixed(2)}`
      );
      changeScreenInfoValue(
        'Cursor2',
        `${pointer.x.toFixed(2)} ${pointer.y.toFixed(2)}`
      );
    }
  });

  window.addEventListener(EVENT_TYPE.THREE, (evt: any) => {
    if (evt.detail.type === THREE_EVENT_TYPE.OBJECT_HIT) {
      // console.log(evt.detail.type, evt.detail.value);
      changeCustomControlValue('Hit', `${getHit()?.object?.name || ''}`);
    }
  });

  window.addEventListener(EVENT_TYPE.THREE, (evt: any) => {
    if (evt.detail.type === THREE_EVENT_TYPE.OBJECT_SELECTED) {
      // console.log(evt.detail.type, evt.detail.value);
    }
  });

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

  // The order this is fired is Scene, Scenario, ControlPanel
  // in the same order as ScenarioSelect initializes the scenario
  // @ts-ignore
  window.addEventListener(EVENT_TYPE.CUSTOM_CONTROL, (evt: CustomEvent) => {
    if (evt.detail.type === CUSTOM_CONTROL_EVENT_TYPE.VALUE_CHANGED) {
      if (['FPS', 'Pointer', 'Hit', 'Camera'].includes(evt.detail.name)) return;
      if (evt.detail.name === 'B') {
        cube2.position.y = evt.detail.value;
      } else if (evt.detail.name === 'C') {
        cube2.visible = evt.detail.value;
      } else if (evt.detail.name === 'S') {
        cube2.material.color.set(
          evt.detail.value === '0x00ff00'
            ? 0x00ff00
            : evt.detail.value === '0x00ffff'
            ? 0x00ffff
            : 0xffff00
        );
      } else if (evt.detail.name === 'F') {
        cube1.rotation.y = evt.detail.value;
      } else if (evt.detail.name === 'I') {
        cube1.position.y = evt.detail.value;
      }
      // console.log(evt.detail.type, evt.detail.name, evt.detail.value);
    }
  });

  window.addEventListener('keydown', (evt: KeyboardEvent) => {
    if (evt.key === 'r') {
      cube1.rotation.x += 0.1;
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

  addCustomControl<CustomFloatControl>({
    type: 'float',
    name: 'F',
    label: 'Float',
    value: 0,
    min: 0,
    max: 1
  });
  addCustomControl<CustomIntegerControl>({
    type: 'integer',
    name: 'I',
    label: 'Cube1 Y',
    value: 0,
    min: 0,
    max: 2
  });
  addCustomControl<CustomSelectControl>({
    type: 'select',
    name: 'S',
    label: 'Cube2 Color',
    value: '0x00ff00',
    options: ['0x00ff00', '0x00ffff', '0xffff00']
  });
  addCustomControl<CustomBooleanControl>({
    type: 'boolean',
    name: 'C',
    label: 'Cube2 visible',
    value: true
  });
  addCustomControl<CustomButtonControl>({
    type: 'button',
    name: 'B',
    label: 'Cube2 Y',
    value: 0,
    defaultValue: 0,
    precision: 2,
    step: 0.1
  });
  addCustomControl<CustomInfoControl>({
    type: 'info',
    name: 'Pointer',
    label: 'Pointer',
    value: 'Some info'
  });
  addCustomControl<CustomInfoControl>({
    type: 'info',
    name: 'Hit',
    label: 'Hit',
    value: 'Some info'
  });
  addCustomControl<CustomInfoControl>({
    type: 'info',
    name: 'Camera',
    label: 'Camera',
    value: 'Some info'
  });
  addCustomControl<CustomInfoControl>({
    type: 'info',
    name: 'Camera2',
    label: 'Camera2',
    value: 'Some info'
  });
  addCustomControl<CustomInfoControl>({
    type: 'info',
    name: 'Camera3',
    label: 'Camera3',
    value: 'Some info'
  });

  const cube1 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
  );
  cube1.name = 'cube1';
  cube1.position.set(0, 0, 0);
  (cube1.userData as UserData).isInteractive = true;
  scene.add(cube1);

  const cube2 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  );
  cube2.name = 'cube2';
  cube2.position.set(2, 0, 0);
  (cube2.userData as UserData).isInteractive = true;
  // automatically adding Line
  (cube2.userData as UserData).lineTo = {
    object: cube1,
    color: 0xffff00
  };

  cube1.add(cube2);

  const cube3 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0x0000ff })
  );
  cube3.name = 'cube3';
  cube3.position.set(2, 0, 0);
  (cube3.userData as UserData).isInteractive = true;

  cube2.add(cube3);

  // manually adding Line
  const line2 = new Line(cube2, cube3, 0xffff00);
  line2.name = 'line2';
  scene.add(line2);

  addScreenInfo({
    linkObject: cube1,
    name: 'Cube1',
    value: '?',
    position: { x: 0, y: 0 },
    // size: { width: 0, height: 0 },
    color: { bg: 'rgba(0,0,0,0.5)', fg: 'white' }
  });

  addScreenInfo({
    linkObject: cube2,
    name: 'Cube2',
    value: '?',
    position: { x: 0, y: 0 },
    size: { width: 40, height: 40 },
    color: { bg: 'rgba(0,0,0,0.5)', fg: 'white' }
  });

  addScreenInfo({
    name: 'Cursor',
    value: '?',
    position: { x: 40, y: 10 },
    size: { width: 80, height: 20 },
    color: { bg: 'rgba(100,100,100,0.5)', fg: 'white' }
  });
  addScreenInfo({
    name: 'Cursor2',
    value: '?',
    position: { x: 40, y: 30 },
    size: { width: 80, height: 20 },
    color: { bg: 'rgba(100,100,100,0.5)', fg: 'white' }
  });

  const tick = () => {
    const delta = getDelta();
    cube1.rotation.x += 0.5 * delta;
    changeScreenInfoValue('Cube1', `${cube1.rotation.x.toFixed(2)}`);
    changeScreenInfoValue('Cube2', `${cube2.rotation.y.toFixed(2)}`);
    changeCustomControlValue(
      'Camera',
      `dist: ${getCamera()
        .position.length()
        .toFixed(2)} zoom: ${getCamera().zoom.toFixed(2)}`
    );
    changeCustomControlValue(
      'Camera2',
      `x: ${getCamera().position.x.toFixed(
        2
      )} y: ${getCamera().position.y.toFixed(
        2
      )} z: ${getCamera().position.z.toFixed(2)}`
    );
    changeCustomControlValue(
      'Camera3',
      `x: ${getCamera().rotation.x.toFixed(
        2
      )} y: ${getCamera().rotation.y.toFixed(
        2
      )} z: ${getCamera().rotation.z.toFixed(2)}`
    );
  };
  loop(tick);
};

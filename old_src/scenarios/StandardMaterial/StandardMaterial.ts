import * as THREE from 'three';
import type { Config } from 'old_src/config';
import type { SceneObjects } from 'old_src/scene';
import {
  EVENT_TYPE,
  THREE_EVENT_TYPE,
  STANDARD_CONTROL_EVENT_TYPE,
  CUSTOM_CONTROL_EVENT_TYPE
} from 'old_src/constants';
import type { UserData } from 'old_src/types.ts';

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
    loop
    // pointer,
    // sceneSize,
    // getCamera,
    // getHit,
    // addCustomControl,
    // changeScreenInfoValue,
    // addScreenInfo,
    // changeCustomControlValue,
    // getClock,
    // getDelta
    // getInteractiveObjects
    // gui
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
    }
  });

  window.addEventListener(EVENT_TYPE.THREE, (evt: any) => {
    if (evt.detail.type === THREE_EVENT_TYPE.OBJECT_HIT) {
      // console.log(evt.detail.type, evt.detail.value);
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
      // console.log(evt.detail.type, evt.detail.name, evt.detail.value);
    }
  });

  window.addEventListener('keydown', (_evt: KeyboardEvent) => {
    // console.log(evt.key);
  });

  function handleSelectedObjectTransform(
    _evtType: EVENT_TYPE,
    _object: THREE.Object3D
  ) {
    // console.log(_evtType, 'position', _object.position);
    // console.log(_evtType, 'rotation', _object.rotation);
    // console.log(_evtType, 'scale', _object.scale);
  }

  const loadingManager = new THREE.LoadingManager();

  // loadingManager.onLoad = function () {
  //   console.log('Loading complete!');
  // };
  //

  // loadingManager.onError = function (url) {
  //   console.log('There was an error loading ' + url);
  // };

  const textureLoader = new THREE.TextureLoader(loadingManager);
  const colorTexture = textureLoader.load('textures/door/color.jpg');

  const alphaTexture = textureLoader.load('textures/door/alpha.jpg');
  // const heightTexture = textureLoader.load('textures/door/height.jpg');
  const normalTexture = textureLoader.load('textures/door/normal.jpg');
  const ambientOcclusionTexture = textureLoader.load(
    'textures/door/ambientOcclusion.jpg'
  );
  const metalnessTexture = textureLoader.load('textures/door/metalness.jpg');
  const roughnessTexture = textureLoader.load('textures/door/roughness.jpg');

  colorTexture.colorSpace = THREE.SRGBColorSpace;
  // colorTexture.minFilter = THREE.NearestFilter;

  const cube1 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({
      map: colorTexture,
      alphaMap: alphaTexture,
      transparent: true,
      side: THREE.DoubleSide,
      flatShading: true,
      metalnessMap: metalnessTexture,
      metalness: 1,
      roughnessMap: roughnessTexture,
      roughness: 1,
      aoMap: ambientOcclusionTexture,
      aoMapIntensity: 1,
      normalMap: normalTexture,
      normalScale: new THREE.Vector2(1, 1)
    })
  );
  console.log(cube1.geometry.attributes);
  cube1.name = 'cube1';
  cube1.position.set(0, 0, 0);
  (cube1.userData as UserData).isInteractive = true;
  scene.add(cube1);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  scene.add(directionalLight);

  const tick = () => {};
  loop(tick);
};

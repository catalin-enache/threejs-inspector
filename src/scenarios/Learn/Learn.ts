import * as THREE from 'three';
import type { Config } from 'src/config';
import type { SceneObjects } from 'src/scene';
import {
  EVENT_TYPE,
  THREE_EVENT_TYPE,
  STANDARD_CONTROL_EVENT_TYPE,
  CUSTOM_CONTROL_EVENT_TYPE
} from 'src/constants';

const params = {
  color: '#ff0000',
  feedback: 0,
  myString: 'lil-gui',
  multiline: 'lil-gui\nawesome'
};

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
    gui
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

  // const geometry = new THREE.BufferGeometry();
  // // prettier-ignore
  // const vertices = new Float32Array([
  //   -1.0, -1.0,  1.0, // v0
  //   1.0, -1.0,  1.0, // v1
  //   1.0,  1.0,  1.0, // v2
  //
  //   1.0,  1.0,  1.0, // v3
  //   -1.0,  1.0,  1.0, // v4
  //   -1.0, -1.0,  1.0  // v5
  // ]);
  // // itemSize = 3 because there are 3 values (components) per vertex
  // geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  // const material = new THREE.MeshBasicMaterial({
  //   color: 0xff0000,
  //   wireframe: true
  // });
  // const mesh = new THREE.Mesh(geometry, material);
  // scene.add(mesh);

  const geometry = new THREE.BufferGeometry();
  // prettier-ignore
  const vertices = new Float32Array( [
    -1.0, -1.0,  1.0, // v0
    1.0, -1.0,  1.0, // v1
    1.0,  1.0,  1.0, // v2
    -1.0,  1.0,  1.0, // v3
  ] );

  const indices = [0, 1, 2, 2, 3, 0];
  geometry.setIndex(indices);
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  const material = new THREE.MeshBasicMaterial({
    color: params.color,
    wireframe: true
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  gui
    .add(mesh.position, 'y')
    .min(-3)
    .max(3000000)
    .step(0.01)
    .name('y')
    .decimals(2);
  gui.add(material, 'wireframe');
  gui.addColor(params, 'color').onChange((color: string) => {
    material.color.set(color);
  });
  const feedbackController = gui
    .add(params, 'feedback', -1, 1)
    .listen()
    .onChange((value: number) => {
      mesh.position.y = value;
    })
    .decimals(2);
  const textController = gui.add(params, 'myString').name('MyString').listen();
  gui.addInfo(params, 'multiline').name('Info').listen();

  // const geometry = new THREE.BoxGeometry(1, 1, 1);
  // const wireframe = new THREE.WireframeGeometry(geometry);
  // const line = new THREE.LineSegments(wireframe);
  // (line.material as THREE.Material).depthTest = false;
  // (line.material as THREE.Material).opacity = 0.25;
  // (line.material as THREE.Material).transparent = true;
  // scene.add(line);

  function handleSelectedObjectTransform(
    _evtType: EVENT_TYPE,
    _object: THREE.Object3D
  ) {
    // console.log(_evtType, 'position', _object.position);
    // console.log(_evtType, 'rotation', _object.rotation);
    // console.log(_evtType, 'scale', _object.scale);
  }

  const tick = () => {
    // params.feedback = Math.sin(Date.now() / 1000);
    feedbackController.setValue(Math.sin(Date.now() / 1000));
    textController.setValue(Date.now());
    // infoController.setValue(Date.now() + '\n' + Date.now() + '\n' + Date.now());
    params.multiline = Date.now() + '\n' + Date.now() + '\n' + Date.now();
    // geometry.rotateZ(getDelta());
  };
  loop(tick);
};

import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// @ts-ignore
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import {
  EVENT_TYPE,
  THREE_EVENT_TYPE,
  STANDARD_CONTROL_EVENT_TYPE,
  CUSTOM_CONTROL_EVENT_TYPE
} from './constants';
import type { Config, SceneSize } from './config';
import { setupFPSCamera } from 'src/sceneModules/fpsCamera';
import { resetCamera } from 'src/sceneModules/resetCamera';
import { focusCamera } from 'src/sceneModules/focusCamera';
import {
  CustomControl,
  CustomControls,
  ScreenInfo,
  ScreenInfos
} from 'src/types';

type getHitsParams = {
  raycaster: THREE.Raycaster;
  pointer: THREE.Vector2;
  camera: THREE.Camera;
};

const _vector = new THREE.Vector3();
export const project3DCoordinateOnCamera = ({
  camera,
  sceneSize,
  object
}: {
  camera: THREE.Camera;
  sceneSize: SceneSize;
  object: THREE.Object3D;
}) => {
  const widthHalf = 0.5 * sceneSize.width;
  const heightHalf = 0.5 * sceneSize.height;
  object.updateMatrixWorld();
  camera.updateMatrixWorld();
  // Get the position of the center of the object in world space
  _vector.setFromMatrixPosition(object.matrixWorld);
  // Project the 3D position vector onto the 2D screen using the camera
  _vector.project(camera);
  const x = widthHalf + _vector.x * widthHalf; // good
  const y = heightHalf - _vector.y * heightHalf; // good
  // const x = (_vector.x * 0.5 + 0.5) * sceneSize.width; // good
  // const y = (_vector.y * -0.5 + 0.5) * sceneSize.height; // good

  const roundedX = x.toFixed(2);
  const roundedY = y.toFixed(2);

  return { x: +roundedX, y: +roundedY };
};

const init = (config: Config) => {
  const canvas = document.querySelector('canvas#webgl')!;
  const _hits: THREE.Intersection<THREE.Object3D<THREE.Object3DEventMap>>[] =
    [];
  let hit: THREE.Intersection<THREE.Object3D<THREE.Object3DEventMap>> | null;
  const interactiveObjects: THREE.Object3D[] = [];
  const pointer = new THREE.Vector2(0, 0);
  const raycaster = new THREE.Raycaster();
  const sceneSize: SceneSize = {
    width: 0,
    height: 0
  };
  let selectedObject: THREE.Object3D | null = null;
  const customControls: CustomControls = {};
  const screenInfos: ScreenInfos = {};
  // this has greater precedence over orbitControls.enabled
  // orbitControls.enabled can become enabled only if orbitControlsAreEnabled is true
  let orbitControlsAreEnabled = true;
  let fps = 0;

  const getHits = ({ raycaster, pointer, camera }: getHitsParams) => {
    raycaster.setFromCamera(pointer, camera);
    _hits.length = 0;
    raycaster.intersectObjects(interactiveObjects, false, _hits);
    if (_hits.length && hit?.object !== _hits[0].object) {
      hit = _hits[0];
      window.dispatchEvent(
        new CustomEvent(EVENT_TYPE.THREE, {
          detail: {
            type: THREE_EVENT_TYPE.OBJECT_HIT,
            value: hit
          }
        })
      );
    } else if (!_hits.length && hit !== null) {
      hit = null;
      window.dispatchEvent(
        new CustomEvent(EVENT_TYPE.THREE, {
          detail: {
            type: THREE_EVENT_TYPE.OBJECT_HIT,
            value: hit
          }
        })
      );
    }
  };

  const setSceneSize = () => {
    sceneSize.width = window.innerWidth;
    sceneSize.height = window.innerHeight;
  };

  const setPointer = (evt: PointerEvent) => {
    // @ts-ignore
    pointer.x = (evt.clientX / sceneSize.width) * 2 - 1;
    // @ts-ignore
    pointer.y = -(evt.clientY / sceneSize.height) * 2 + 1;
  };

  setSceneSize();

  canvas.addEventListener('contextmenu', (evt: Event) => {
    evt.preventDefault();
  });

  canvas.addEventListener('pointerdown', () => {
    window.dispatchEvent(
      new CustomEvent(EVENT_TYPE.THREE, {
        detail: {
          type: THREE_EVENT_TYPE.POINTER_DOWN,
          value: pointer
        }
      })
    );
  });

  canvas.addEventListener('pointerup', () => {
    window.dispatchEvent(
      new CustomEvent(EVENT_TYPE.THREE, {
        detail: {
          type: THREE_EVENT_TYPE.POINTER_UP,
          value: pointer
        }
      })
    );
  });

  canvas.addEventListener('pointermove', (evt: Event) => {
    setPointer(evt as PointerEvent);
    getHits({ raycaster, pointer, camera });
    window.requestAnimationFrame(() => {
      window.dispatchEvent(
        new CustomEvent(EVENT_TYPE.THREE, {
          detail: {
            type: THREE_EVENT_TYPE.POINTER_MOVE,
            value: pointer
          }
        })
      );
    });
  });

  canvas.addEventListener('click', () => {
    window.dispatchEvent(
      new CustomEvent(EVENT_TYPE.THREE, {
        detail: {
          type: THREE_EVENT_TYPE.POINTER_CLICK,
          value: pointer
        }
      })
    );
  });

  // @ts-ignore
  canvas.addEventListener('dblclick', (evt: PointerEvent) => {
    if (evt.ctrlKey) {
      const fullscreenElement =
        // @ts-ignore
        document.fullscreenElement || document.webkitFullscreenElement;
      const requestFullscreen =
        // @ts-ignore
        canvas.requestFullscreen || canvas.webkitRequestFullscreen;
      const exitFullscreen =
        // @ts-ignore
        document.exitFullscreen || document.webkitExitFullscreen;

      if (!fullscreenElement) {
        requestFullscreen.call(canvas);
      } else {
        exitFullscreen.call(document);
      }
    } else {
      getHits({ raycaster, pointer, camera });
      const hit = getHit();
      if (hit) {
        transformControls.attach(hit.object);
        selectedObject = hit.object;
      } else {
        selectedObject = null;
        transformControls.detach();
      }
      window.dispatchEvent(
        new CustomEvent(EVENT_TYPE.THREE, {
          detail: {
            type: THREE_EVENT_TYPE.OBJECT_SELECTED,
            value: hit?.object || null
          }
        })
      );
    }
  });

  window.addEventListener('resize', () => {
    setSceneSize();
    updateCameras();
    renderer.setSize(sceneSize.width, sceneSize.height);
    // for when moving the window from a retina screen to a non-retina screen
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    window.requestAnimationFrame(() => {
      window.dispatchEvent(
        new CustomEvent(EVENT_TYPE.THREE, {
          detail: {
            type: THREE_EVENT_TYPE.SCENE_RESIZE,
            value: sceneSize
          }
        })
      );
    });
  });

  window.addEventListener('keydown', (evt: KeyboardEvent) => {
    if (evt.code === 'Space') {
      if (getIsPlaying()) {
        pause();
      } else {
        play();
      }
    } else if (
      ['Numpad1', 'Numpad7', 'Numpad3', 'Numpad9'].includes(evt.code)
    ) {
      resetCamera({ code: evt.code, camera, orbitControls });
    } else if (evt.code === 'Numpad5') {
      switchCamera();
    } else if (evt.code === 'KeyF') {
      focusCamera({ orbitControls, transformControls });
    } else if (evt.code === 'KeyO') {
      toggleOrbitControls();
    }
  });

  window.addEventListener(EVENT_TYPE.STANDARD_CONTROL, (evt: any) => {
    if (evt.detail.type === STANDARD_CONTROL_EVENT_TYPE.CAMERA_TYPE) {
      switchCamera();
    } else if (
      evt.detail.type === STANDARD_CONTROL_EVENT_TYPE.SELECTED_OBJECT_TRANSFORM
    ) {
      if (evt.detail.value.userData.screenInfo) {
        // pass
      }
    }
  });

  window.addEventListener(EVENT_TYPE.THREE, (evt: any) => {
    if (evt.detail.type === THREE_EVENT_TYPE.SELECTED_OBJECT_TRANSFORM) {
      if (evt.detail.value.userData.screenInfo) {
        // pass
      }
    }
  });

  // The order this is fired is Scene, Scenario, ControlPanel (if it has a listener)
  // in the same order as ScenarioSelect initializes the scenario
  // @ts-ignore
  window.addEventListener(EVENT_TYPE.CUSTOM_CONTROL, (evt: CustomEvent) => {
    if (evt.detail.type === CUSTOM_CONTROL_EVENT_TYPE.VALUE_CHANGED) {
      const { name, value } = evt.detail;
      customControls[name].value = value;
    }
  });

  // key O
  const toggleOrbitControls = () => {
    orbitControlsAreEnabled = !orbitControlsAreEnabled;
    orbitControls.enabled = orbitControlsAreEnabled;
  };

  const addCustomControl = <C extends CustomControl>(control: C) => {
    customControls[control.name] = control;
    window.dispatchEvent(
      new CustomEvent(EVENT_TYPE.CUSTOM_CONTROL, {
        detail: {
          type: CUSTOM_CONTROL_EVENT_TYPE.CREATE,
          name: control.name,
          value: customControls
        }
      })
    );
    setTimeout(() => {
      // to honor initial value
      window.dispatchEvent(
        new CustomEvent(EVENT_TYPE.CUSTOM_CONTROL, {
          detail: {
            type: CUSTOM_CONTROL_EVENT_TYPE.VALUE_CHANGED,
            name: control.name,
            value: control.value
          }
        })
      );
    }, 0);
  };

  // This is dispatched from Scene as well as from CustomControlInput
  const changeCustomControlValue = (name: string, value: any) => {
    if (!customControls[name]) return;
    // it is also updated when scene listens for this event
    // so updating here is in theory redundant
    customControls[name].value = value;
    window.dispatchEvent(
      new CustomEvent(EVENT_TYPE.CUSTOM_CONTROL, {
        detail: {
          type: CUSTOM_CONTROL_EVENT_TYPE.VALUE_CHANGED,
          name,
          value
        }
      })
    );
  };

  const addScreenInfo = (info: ScreenInfo) => {
    screenInfos[info.name] = info;
    if (!info.linkObject) return;
    info.linkObject.userData.screenInfo = info;
  };

  const refreshAllScreenInfoPositions = () => {
    Object.keys(screenInfos).forEach((name) => {
      refreshScreenInfoPosition(name);
    });
  };

  const refreshScreenInfoPosition = (name: string) => {
    if (!screenInfos[name] || !screenInfos[name].linkObject) return;
    const object = screenInfos[name].linkObject!;
    const pos = project3DCoordinateOnCamera({
      camera,
      sceneSize,
      object
    });
    screenInfos[name].position = pos;
  };

  const changeScreenInfoValue = (name: string, value: any) => {
    if (!screenInfos[name]) return;
    screenInfos[name].value = value;
  };

  const updateCameras = () => {
    const aspectRatio = sceneSize.width / sceneSize.height;
    perspectiveCamera.aspect = aspectRatio;
    perspectiveCamera.updateProjectionMatrix();

    orthographicCamera.left = sceneSize.width / -config.orthographicCameraRatio;
    orthographicCamera.right = sceneSize.width / config.orthographicCameraRatio;
    orthographicCamera.top = sceneSize.height / config.orthographicCameraRatio;
    orthographicCamera.bottom =
      sceneSize.height / -config.orthographicCameraRatio;
    orthographicCamera.updateProjectionMatrix();
  };

  const aspectRatio = sceneSize.width / sceneSize.height;
  const perspectiveCamera = new THREE.PerspectiveCamera(
    75,
    aspectRatio,
    0.1,
    100
  );
  perspectiveCamera.position.set(0, 0, 12);
  perspectiveCamera.zoom = 1;
  const orthographicCamera = new THREE.OrthographicCamera(
    -0,
    0,
    0,
    -0,
    0.1,
    100
  );
  orthographicCamera.position.set(0, 0, 12);
  orthographicCamera.zoom = 1;

  updateCameras();

  let camera =
    config.cameraType === 'perspective'
      ? perspectiveCamera
      : orthographicCamera;

  const switchCamera = () => {
    scene.remove(camera);
    if (config.cameraType === 'perspective') {
      config.cameraType = 'orthographic';
      camera = orthographicCamera;
      orbitControls.object = camera;
      transformControls.camera = camera;
    } else {
      config.cameraType = 'perspective';
      camera = perspectiveCamera;
      orbitControls.object = camera;
      transformControls.camera = camera;
    }
    scene.add(camera);
  };

  const axisHelper = new THREE.AxesHelper(1000);

  const orbitControls = new OrbitControls(camera, canvas);
  orbitControls.enabled = orbitControlsAreEnabled;
  orbitControls.enableDamping = false;
  orbitControls.addEventListener('change', () => {
    // pass
  });

  const transformControls = new TransformControls(camera, canvas);
  transformControls.setSpace('local'); // local | world
  transformControls.addEventListener('dragging-changed', function (event: any) {
    if (!orbitControlsAreEnabled) return;
    orbitControls.enabled = !event.value;
  });
  transformControls.addEventListener('objectChange', function (event: any) {
    window.dispatchEvent(
      new CustomEvent(EVENT_TYPE.THREE, {
        detail: {
          type: THREE_EVENT_TYPE.SELECTED_OBJECT_TRANSFORM,
          value: event.target.object
        }
      })
    );
  });

  const scene = new THREE.Scene();
  scene.add(camera);
  scene.add(axisHelper);
  scene.add(transformControls);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
  });
  renderer.setSize(sceneSize.width, sceneSize.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const clock = new THREE.Clock();

  let _lastTime = 0;
  let delta = 0;
  const internalTick = () => {
    delta = getClock().getDelta();
    const currTime = Math.floor(+new Date() / 100);
    const _fps = Math.round(1 / delta);
    if (currTime > _lastTime) {
      fps = _fps;
      _lastTime = currTime;
    }
    return true;
  };

  const getFps = () => fps;
  const getOrbitControls = () => orbitControls;
  const getOrbitControlsAreEnabled = () => orbitControlsAreEnabled;
  const getScreenInfos = () => screenInfos;
  const getDelta = () => delta;
  const getCustomControls = () => customControls;
  const getHit = () => hit;
  const getSelectedObject = () => selectedObject;
  const getCamera = () => camera;
  const getConfig = () => config;
  const getRayCaster = () => raycaster;
  const getTransformControls = () => transformControls;
  const getInteractiveObjects = () => interactiveObjects;
  const getClock = () => clock;

  let isPlaying = false;
  const getIsPlaying = () => isPlaying;
  const play = () => {
    isPlaying = true;
    clock.start();
  };
  const pause = () => {
    clock.stop();
    isPlaying = false;
  };

  const { fpsCamera } = setupFPSCamera({ getCamera, getOrbitControls });
  const loop = (callback: () => void) => {
    refreshAllScreenInfoPositions();
    fpsCamera();
    getIsPlaying() && internalTick() && callback();
    orbitControls.enabled && orbitControls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(() => loop(callback));
  };

  const sceneObjects = {
    pointer,
    sceneSize,
    scene,
    canvas,
    renderer,
    getFps,
    getOrbitControls,
    getOrbitControlsAreEnabled,
    toggleOrbitControls,
    getTransformControls,
    addCustomControl,
    changeCustomControlValue,
    addScreenInfo,
    getScreenInfos,
    changeScreenInfoValue,
    getCustomControls,
    getRayCaster,
    getConfig,
    getCamera,
    switchCamera,
    getHit,
    getSelectedObject,
    getInteractiveObjects,
    getIsPlaying,
    play,
    pause,
    getClock,
    getDelta,
    loop
  };
  window.dispatchEvent(
    new CustomEvent(EVENT_TYPE.THREE, {
      detail: {
        type: THREE_EVENT_TYPE.SCENE_READY,
        value: sceneObjects
      }
    })
  );

  return sceneObjects;
};
export type SceneObjects = ReturnType<typeof init>;
export type Init = typeof init;
export { init };

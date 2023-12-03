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
import { project3DCoordinateOnCamera } from 'src/sceneModules/project3DCoordinateOnCamera';
import { Line } from 'lib/three/Line';
import type {
  CustomControl,
  CustomControls,
  ScreenInfo,
  ScreenInfos,
  UserData,
  InternalContinuousUpdate
} from 'src/types';
import { isInternalContinuousUpdate, hasLiveCycle } from 'src/types';

type GetHitsParams = {
  raycaster: THREE.Raycaster;
  pointer: THREE.Vector2;
  camera: THREE.Camera;
};

const init = (config: Config) => {
  const canvas = document.querySelector('canvas#webgl')!;
  const _hits: THREE.Intersection<THREE.Object3D<THREE.Object3DEventMap>>[] =
    [];
  let hit: THREE.Intersection<THREE.Object3D<THREE.Object3DEventMap>> | null;
  const interactiveObjects: Record<string, THREE.Object3D> = {};
  const internalContinuousUpdates: Record<string, InternalContinuousUpdate> =
    {};
  const pointer = new THREE.Vector2(0, 0);
  const raycaster = new THREE.Raycaster();
  const sceneSize: SceneSize = {
    width: 0,
    height: 0
  };
  let selectedObject: THREE.Object3D | null = null;
  const customControls: CustomControls = {};
  const screenInfos: ScreenInfos = {};
  let showScreenInfo = true;
  // this has greater precedence over orbitControls.enabled
  // orbitControls.enabled can become enabled only if orbitControlsAreEnabled is true
  let orbitControlsAreEnabled = true;
  let fps = 0;
  const axisHelper = new THREE.AxesHelper(1000);
  const scene = new THREE.Scene();
  scene.name = 'scene';

  const canPostWorkerMessage = { current: true };
  const myWorker = new Worker('worker', { type: 'module' });
  myWorker.onmessage = function (e) {
    const [command, data] = e.data;
    console.log('Message received from worker', { command, data });
    canPostWorkerMessage.current = true;
  };

  const postMessageToWorker = (data: any, force = false) => {
    if (!force && !canPostWorkerMessage.current) return;
    canPostWorkerMessage.current = false;
    myWorker.postMessage(data);
  };

  postMessageToWorker(['init', { config }], true);

  THREE.Object3D.prototype.add = (function () {
    const originalAdd = THREE.Object3D.prototype.add;
    return function (this: THREE.Object3D, ...objects: THREE.Object3D[]) {
      objects.forEach((object) => {
        const userData = object.userData as UserData;
        userData.scene = scene;
        originalAdd.call(this, object);
        if (hasLiveCycle(object)) {
          object.onAdded({ parent: this, scene, sceneObjects });
        }
        if (userData.isInteractive) {
          interactiveObjects[object.uuid] = object;
        }
        if (isInternalContinuousUpdate(object)) {
          internalContinuousUpdates[object.uuid] = object;
        }
        if (userData.lineTo) {
          // this makes dependants (a Line) on object and userData.lineTo.object
          const line = new Line(
            object,
            userData.lineTo.object,
            userData.lineTo.color,
            userData.lineTo.infoOptions
          );
          line.name = `lineTo_${userData.lineTo.object.name}_from_${object.name}`;
          scene.add(line);
        }
      });
      return this;
    };
  })();

  THREE.Object3D.prototype.remove = (function () {
    const originalRemove = THREE.Object3D.prototype.remove;
    return function (this: THREE.Object3D, ...objects: THREE.Object3D[]) {
      objects.forEach((object) => {
        const userData = object.userData as UserData;
        if (userData.isInteractive) {
          delete interactiveObjects[object.uuid];
        }
        if (isInternalContinuousUpdate(object)) {
          delete internalContinuousUpdates[object.uuid];
        }
        if (hasLiveCycle(object)) {
          object.onRemoved({ parent: this, scene, sceneObjects });
        }
        if (userData.dependants) {
          Object.values(userData.dependants).forEach((dependant) => {
            scene.remove(dependant);
          });
        }
        originalRemove.call(this, object);
      });
      return this;
    };
  })();

  const toggleShowScreenInfo = () => {
    showScreenInfo = !showScreenInfo;
  };

  const toggleAxisHelper = () => {
    axisHelper.visible = !axisHelper.visible;
  };

  const toggleTransformControlsSpace = () => {
    transformControls.setSpace(
      transformControls.space === 'local' ? 'world' : 'local'
    );
  };

  const setTransformControlsMode = (mode: string) => {
    transformControls.setMode(mode);
  };

  const getHits = ({ raycaster, pointer, camera }: GetHitsParams) => {
    raycaster.setFromCamera(pointer, camera);
    _hits.length = 0;
    raycaster.intersectObjects(Object.values(interactiveObjects), false, _hits);
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
    } else if (evt.code === 'KeyL') {
      toggleTransformControlsSpace();
    } else if (evt.code === 'KeyI') {
      toggleShowScreenInfo();
    } else if (evt.code === 'KeyX') {
      toggleAxisHelper();
    } else if (
      evt.code === 'Comma' ||
      evt.code === 'Period' ||
      evt.code === 'Slash'
    ) {
      evt.code === 'Comma' && setTransformControlsMode('translate');
      evt.code === 'Period' && setTransformControlsMode('rotate');
      evt.code === 'Slash' && setTransformControlsMode('scale');
    }
  });

  window.addEventListener(EVENT_TYPE.STANDARD_CONTROL, (evt: any) => {
    if (
      evt.detail.type === STANDARD_CONTROL_EVENT_TYPE.SELECTED_OBJECT_TRANSFORM
    ) {
      // pass
    }
  });

  window.addEventListener(EVENT_TYPE.THREE, (evt: any) => {
    if (evt.detail.type === THREE_EVENT_TYPE.SELECTED_OBJECT_TRANSFORM) {
      // pass
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
    if (customControls[name].type === 'info') return;
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
    const userData = info.linkObject.userData as UserData;
    userData.screenInfo = info;
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
  const cameraPosition = new THREE.Vector3(0, 0, 12);
  const perspectiveCamera = new THREE.PerspectiveCamera(
    75,
    aspectRatio,
    0.1,
    100
  );
  perspectiveCamera.position.copy(cameraPosition);
  perspectiveCamera.zoom = 1;
  const orthographicCamera = new THREE.OrthographicCamera(
    -0,
    0,
    0,
    -0,
    0.1,
    100
  );
  orthographicCamera.position.copy(cameraPosition);
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
  const internalPlayTick = () => {
    delta = getClock().getDelta();
    const currTime = Math.floor(+new Date() / 100);
    const _fps = Math.round(1 / delta);
    if (currTime > _lastTime) {
      fps = _fps;
      _lastTime = currTime;
    }
    return true;
  };

  const getAxisHelper = () => axisHelper;
  const getShowScreenInfo = () => showScreenInfo;
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

  const frustum = new THREE.Frustum();
  const cameraViewProjectionMatrix = new THREE.Matrix4();
  function updateFrustum() {
    camera.updateMatrix();
    camera.updateMatrixWorld();
    camera.updateProjectionMatrix();
    camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
    cameraViewProjectionMatrix.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    );
    frustum.setFromProjectionMatrix(cameraViewProjectionMatrix);
  }

  const box = new THREE.Box3();
  const objWorldPosition = new THREE.Vector3();
  function isObjectVisibleInFrustum(
    obj: THREE.Object3D,
    withBoundingBox = false
  ) {
    if (withBoundingBox) {
      box.setFromObject(obj);
      return frustum.intersectsBox(box);
    } else {
      obj.getWorldPosition(objWorldPosition);
      return frustum.containsPoint(objWorldPosition);
    }
  }

  function updateObjectsFrustumVisibility() {
    if (config.objectsToCheckIfVisibleInCamera === 'screenInfo') {
      // this is faster than traversing the scene (see below)
      Object.keys(screenInfos).forEach((name) => {
        const screenInfo = screenInfos[name];
        const linkObject = screenInfo.linkObject;
        if (linkObject) {
          (linkObject.userData as UserData).isVisibleFromCamera =
            isObjectVisibleInFrustum(
              linkObject,
              config.checkVisibleInFrustumUsing === 'boundingBox'
            );
        }
      });
    } else if (config.objectsToCheckIfVisibleInCamera === 'all') {
      // this is slower than iterating through screenInfos (see before)
      scene.traverse(function (object) {
        if (object.isObject3D) {
          (object.userData as UserData).isVisibleFromCamera =
            isObjectVisibleInFrustum(
              object,
              config.checkVisibleInFrustumUsing === 'boundingBox'
            );
        }
      });
    }
  }

  const internalContinuousTick = () => {
    updateFrustum();
    updateObjectsFrustumVisibility();
    Object.values(internalContinuousUpdates).forEach((object) => {
      object.internalContinuousUpdate();
    });
  };

  const loop = (callback: () => void) => {
    refreshAllScreenInfoPositions();
    fpsCamera();
    internalContinuousTick();
    getIsPlaying() && internalPlayTick() && callback();
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
    toggleAxisHelper,
    getAxisHelper,
    toggleShowScreenInfo,
    getShowScreenInfo,
    getFps,
    getOrbitControls,
    getOrbitControlsAreEnabled,
    toggleOrbitControls,
    getTransformControls,
    toggleTransformControlsSpace,
    setTransformControlsMode,
    addCustomControl,
    changeCustomControlValue,
    getCustomControls,
    addScreenInfo,
    getScreenInfos,
    changeScreenInfoValue,
    getRayCaster,
    getConfig,
    getCamera,
    switchCamera,
    focusCamera,
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

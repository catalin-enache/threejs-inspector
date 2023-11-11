/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// @ts-ignore
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import {
  EVENT_TYPE,
  THREE_EVENT_TYPE,
  CONTROL_EVENT_TYPE,
  CONTROLS_AREA_WIDTH
} from './constants';
import type { Config, SceneSize } from './config';

type getHitsParams = {
  raycaster: THREE.Raycaster;
  pointer: THREE.Vector2;
  camera: THREE.Camera;
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
            object: hit
          }
        })
      );
    } else if (!_hits.length && hit !== null) {
      hit = null;
      window.dispatchEvent(
        new CustomEvent(EVENT_TYPE.THREE, {
          detail: {
            type: THREE_EVENT_TYPE.OBJECT_HIT,
            object: hit
          }
        })
      );
    }
  };

  const setSceneSize = () => {
    sceneSize.width = window.innerWidth - CONTROLS_AREA_WIDTH;
    sceneSize.height = window.innerHeight;
  };

  const setPointer = (evt: PointerEvent) => {
    // @ts-ignore
    pointer.x = (evt.clientX / sceneSize.width) * 2 - 1;
    // @ts-ignore
    pointer.y = -(evt.clientY / sceneSize.height) * 2 + 1;
  };

  setSceneSize();

  canvas.addEventListener('pointerdown', () => {
    window.dispatchEvent(
      new CustomEvent(EVENT_TYPE.THREE, {
        detail: {
          type: THREE_EVENT_TYPE.POINTER_DOWN,
          object: pointer
        }
      })
    );
  });

  canvas.addEventListener('pointerup', () => {
    window.dispatchEvent(
      new CustomEvent(EVENT_TYPE.THREE, {
        detail: {
          type: THREE_EVENT_TYPE.POINTER_UP,
          object: pointer
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
            object: pointer
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
          object: pointer
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
            object: hit?.object || null
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
            object: sceneSize
          }
        })
      );
    });
  });

  window.addEventListener(EVENT_TYPE.CONTROL, (evt: any) => {
    if (evt.detail.type === CONTROL_EVENT_TYPE.CAMERA_TYPE) {
      switchCamera();
    } else if (evt.detail.type === CONTROL_EVENT_TYPE.OBJECT_TRANSFORM) {
      // pass
    }
  });

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
  perspectiveCamera.position.set(0, 0, 3);
  perspectiveCamera.zoom = 1;
  const orthographicCamera = new THREE.OrthographicCamera(
    -0,
    0,
    0,
    -0,
    0.1,
    100
  );
  orthographicCamera.position.set(0, 0, 3);
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
  orbitControls.enabled = true;
  orbitControls.enableDamping = false;

  const transformControls = new TransformControls(camera, canvas);
  transformControls.setSpace('local'); // local | world
  transformControls.addEventListener('dragging-changed', function (event: any) {
    orbitControls.enabled = !event.value;
  });
  transformControls.addEventListener('objectChange', function (event: any) {
    window.dispatchEvent(
      new CustomEvent(EVENT_TYPE.THREE, {
        detail: {
          type: THREE_EVENT_TYPE.OBJECT_TRANSFORM,
          object: event.target.object
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

  const getHit = () => hit;
  const getSelectedObject = () => selectedObject;
  const getCamera = () => camera;
  const getConfig = () => config;
  const getRayCaster = () => raycaster;
  const getTransformControls = () => transformControls;
  const getInteractiveObjects = () => interactiveObjects;

  const loop = (callback: () => void) => {
    orbitControls.update();
    renderer.render(scene, camera);
    callback();
    window.requestAnimationFrame(() => loop(callback));
  };

  const sceneObjects = {
    pointer,
    sceneSize,
    scene,
    canvas,
    renderer,
    orbitControls,
    getTransformControls,
    getRayCaster,
    getConfig,
    getCamera,
    switchCamera,
    getHit,
    getSelectedObject,
    getInteractiveObjects,
    loop
  };
  window.dispatchEvent(
    new CustomEvent(EVENT_TYPE.THREE, {
      detail: {
        type: THREE_EVENT_TYPE.SCENE_READY,
        object: sceneObjects
      }
    })
  );

  return sceneObjects;
};

export { init };

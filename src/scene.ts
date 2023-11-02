/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// @ts-ignore
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import type { Config, SceneSize } from './config';

type getHitsParams = {
  raycaster: THREE.Raycaster;
  pointer: THREE.Vector2;
  camera: THREE.Camera;
  config: Config;
};

const _hits: THREE.Intersection<THREE.Object3D<THREE.Object3DEventMap>>[] = [];
let hit: THREE.Intersection<THREE.Object3D<THREE.Object3DEventMap>> | null;
const getHits = ({ raycaster, pointer, camera, config }: getHitsParams) => {
  raycaster.setFromCamera(pointer, camera);
  _hits.length = 0;
  raycaster.intersectObjects(config.interactiveObjects, false, _hits);
  if (_hits.length) {
    hit = _hits[0];
    config.handleHit(hit);
  } else {
    hit = null;
    config.handleHit(hit);
  }
};

const sceneSize: SceneSize = {
  width: 0,
  height: 0
};

const setSceneSize = (config: Config) => {
  sceneSize.width = window.innerWidth - config.controlsAreaWidth;
  sceneSize.height = window.innerHeight;
};

const pointer = new THREE.Vector2(0, 0);

const setPointer = (evt: PointerEvent) => {
  // @ts-ignore
  pointer.x = (evt.clientX / sceneSize.width) * 2 - 1;
  // @ts-ignore
  pointer.y = -(evt.clientY / sceneSize.height) * 2 + 1;
};

const init = (config: Config) => {
  const canvas = document.querySelector('canvas.webgl')!;

  const raycaster = new THREE.Raycaster();

  setSceneSize(config);

  canvas.addEventListener('click', () => {
    getHits({ raycaster, pointer, camera, config });
    if (config.handleClick) {
      window.requestAnimationFrame(() => config.handleClick(pointer));
    }
  });

  canvas.addEventListener('pointermove', (evt: Event) => {
    setPointer(evt as PointerEvent);
    getHits({ raycaster, pointer, camera, config });
    if (config.handleMouseMove) {
      window.requestAnimationFrame(() => config.handleMouseMove(pointer));
    }
  });

  window.addEventListener('resize', () => {
    setSceneSize(config);
    const aspectRatio = sceneSize.width / sceneSize.height;
    perspectiveCamera.aspect = aspectRatio;
    perspectiveCamera.updateProjectionMatrix();
    renderer.setSize(sceneSize.width, sceneSize.height);
    // for when moving the window from a retina screen to a non-retina screen
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    if (config.handleResize) {
      window.requestAnimationFrame(() => config.handleResize(sceneSize));
    }
  });

  window.addEventListener('dblclick', () => {
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
  });

  const aspectRatio = sceneSize.width / sceneSize.height;
  const perspectiveCamera = new THREE.PerspectiveCamera(
    75,
    aspectRatio,
    1,
    100
  );
  const orthographicCamera = new THREE.OrthographicCamera(
    -1 * aspectRatio,
    1 * aspectRatio,
    1,
    -1,
    1,
    100
  );
  const camera =
    config.cameraType === 'perspective'
      ? perspectiveCamera
      : orthographicCamera;
  camera.position.set(0, 0, 3);

  const axisHelper = new THREE.AxesHelper(100);

  const orbitControls = new OrbitControls(camera, canvas);
  orbitControls.enabled = true;
  orbitControls.enableDamping = true;

  const transformControls = new TransformControls(camera, canvas);
  transformControls.setSpace('local'); // local | world
  transformControls.addEventListener('dragging-changed', function (event: any) {
    orbitControls.enabled = !event.value;
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

  const loop = (callback: () => void) => {
    orbitControls.update();
    renderer.render(scene, camera);
    callback();
    window.requestAnimationFrame(() => loop(callback));
  };

  return {
    pointer,
    sceneSize,
    scene,
    camera,
    canvas,
    renderer,
    orbitControls,
    transformControls,
    raycaster,
    getHit,
    loop
  };
};

export { init };

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import patchThree from 'lib/App/SetUp/patchThree';
import { useAppStore } from 'src/store';
import './testScene.css';

const stats = new Stats();
const canvas = document.createElement('canvas');

document.body.appendChild(canvas);
document.body.appendChild(stats.dom);

type SceneInitConfig = { useFloor?: boolean; sizeUnit?: number };

function init({ useFloor = true, sizeUnit = 100 }: SceneInitConfig = {}) {
  // Note: Vitest does not allow resizing the window
  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  const addResizeHandler = () => {
    // document.body.appendChild(canvas);
    // document.body.appendChild(stats.dom);
    (window.top || window).addEventListener('resize', onWindowResize);
  };

  const removeResizeHandler = () => {
    // canvas.parentNode?.removeChild(canvas);
    // stats.dom.parentNode?.removeChild(stats.dom);
    (window.top || window).removeEventListener('resize', onWindowResize);
  };

  const animate = () => {
    // const delta = clock.getDelta();
    // if (mixer) mixer.update(delta);
    renderer.render(scene, camera);
    stats && stats.update();
  };

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, sizeUnit * 21);
  camera.position.set(sizeUnit, sizeUnit * 2, sizeUnit * 3);

  // const mixer: THREE.AnimationMixer = new THREE.AnimationMixer();
  const clock = new THREE.Clock();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa0a0a0);
  // scene.fog = new THREE.Fog(0xa0a0a0, sizeUnit * 2, sizeUnit * 10);
  scene.__inspectorData.currentCamera = camera;
  patchThree.setCurrentScene(scene);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 5);
  hemiLight.position.set(0, sizeUnit * 2, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 5);
  dirLight.position.set(0, sizeUnit * 2, sizeUnit);
  dirLight.castShadow = true;
  dirLight.shadow.camera.top = (sizeUnit / 10) * 18;
  dirLight.shadow.camera.bottom = -sizeUnit;
  dirLight.shadow.camera.left = -((sizeUnit / 10) * 12);
  dirLight.shadow.camera.right = (sizeUnit / 10) * 12;
  scene.add(dirLight);

  // floor
  if (useFloor) {
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(sizeUnit * 20, sizeUnit * 20),
      new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
  }

  const grid = new THREE.GridHelper(sizeUnit * 20, sizeUnit / 5, 0x000000, 0x000000);
  grid.material.opacity = 0.2;
  grid.material.transparent = true;
  scene.add(grid);

  const axis = new THREE.AxesHelper(sizeUnit * 10);
  scene.add(axis);

  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  renderer.shadowMap.enabled = true;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, sizeUnit, 0);
  controls.update();

  useAppStore.getState().reset();

  return {
    addResizeHandler,
    removeResizeHandler,
    scene,
    camera,
    dirLight,
    hemiLight,
    renderer,
    clock,
    canvas,
    stats,
    controls
  };
}

const withScene =
  (config?: SceneInitConfig) =>
  async (
    fn: (sceneObjects: {
      scene: THREE.Scene;
      camera: THREE.PerspectiveCamera;
      dirLight: THREE.DirectionalLight;
      hemiLight: THREE.HemisphereLight;
      renderer: THREE.WebGLRenderer;
      clock: THREE.Clock;
      canvas: HTMLCanvasElement;
      controls: OrbitControls;
    }) => Promise<(() => void | undefined) | void | undefined>
  ) => {
    const {
      scene,
      camera,
      dirLight,
      hemiLight,
      renderer,
      clock,
      canvas,
      controls,
      addResizeHandler,
      removeResizeHandler
    } = init(config);
    addResizeHandler();
    const cleanUp = await fn({ scene, dirLight, hemiLight, camera, renderer, clock, canvas, controls });
    controls.dispose();
    cleanUp && cleanUp();
    scene.clear();
    removeResizeHandler();
  };

export { withScene };

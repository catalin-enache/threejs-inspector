import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OrbitControls } from 'lib/third_party/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import patchThree from 'lib/App/SetUp/patchThree';
import { useAppStore } from 'src/store';
import './testScene.css';

const stats = new Stats();
const canvas = document.createElement('canvas');

document.body.appendChild(canvas);
document.body.appendChild(stats.dom);

function init() {
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

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
  camera.position.set(100, 200, 300);

  // const mixer: THREE.AnimationMixer = new THREE.AnimationMixer();
  const clock = new THREE.Clock();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa0a0a0);
  // scene.fog = new THREE.Fog(0xa0a0a0, 200, 1000);
  scene.__inspectorData.currentCamera = camera;
  patchThree.setCurrentScene(scene);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 5);
  hemiLight.position.set(0, 200, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 5);
  dirLight.position.set(0, 200, 100);
  dirLight.castShadow = true;
  dirLight.shadow.camera.top = 180;
  dirLight.shadow.camera.bottom = -100;
  dirLight.shadow.camera.left = -120;
  dirLight.shadow.camera.right = 120;
  scene.add(dirLight);

  // ground
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2000, 2000),
    new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  scene.add(mesh);

  const grid = new THREE.GridHelper(2000, 20, 0x000000, 0x000000);
  grid.material.opacity = 0.2;
  grid.material.transparent = true;
  scene.add(grid);

  const axis = new THREE.AxesHelper(1000);
  scene.add(axis);

  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  renderer.shadowMap.enabled = true;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 100, 0);
  controls.update();

  useAppStore.getState().setDestroyOnRemove(true);

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
  () =>
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
    } = init();
    addResizeHandler();
    const cleanUp = await fn({ scene, dirLight, hemiLight, camera, renderer, clock, canvas, controls });
    cleanUp && cleanUp();
    scene.clear();
    removeResizeHandler();
  };

export { withScene };

import * as THREE from 'three';
import { injectInspector } from 'src/lib/injectInspector';
import { CustomParams } from 'lib/customParam.types';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import { SetUpProps } from 'components/SetUp/SetUp';
import { CPanelProps } from 'components/CPanel/CPanel';

export interface InitNativeAppProps {
  renderer?: THREE.WebGLRenderer;
  scene?: THREE.Scene;
  camera?: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  frameloop?: 'always' | 'demand' | 'never';
  autoNavControls?: boolean;
  // if orbitControls are provided, they replace internal OrbitControls when autoNavControls is true
  orbitControls?: any;
  customParams?: CustomParams;
  // for testing
  onSetupEffect?: SetUpProps['onSetupEffect'];
  onThreeChange?: SetUpProps['onThreeChange'];
  onCPanelReady?: CPanelProps['onCPanelReady'];
  onCPanelUnmounted?: CPanelProps['onCPanelUnmounted'];
}

export function initNativeApp(props: InitNativeAppProps) {
  const {
    renderer: _renderer,
    scene: _scene,
    camera: _camera,
    frameloop = 'always',
    autoNavControls = true,
    orbitControls: _orbitControls,
    customParams,
    onThreeChange,
    onSetupEffect,
    onCPanelReady,
    onCPanelUnmounted
  } = props;

  const container = document.createElement('div');
  document.body.appendChild(container);

  let camera = _camera;
  if (!camera) {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 12);
  }

  let scene = _scene;
  if (!scene) {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa0a0a0);
    // scene.fog = new THREE.Fog(0xa0a0a0, 200, 1000);
  }

  // const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 5);
  // hemiLight.position.set(0, 200, 0);
  // scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 5);
  dirLight.position.set(1, 5, 1);
  dirLight.intensity = 4.5;
  dirLight.castShadow = true;
  // dirLight.shadow.camera.top = 180;
  // dirLight.shadow.camera.bottom = -100;
  // dirLight.shadow.camera.left = -120;
  // dirLight.shadow.camera.right = 120;
  scene.add(dirLight);

  const clock = new THREE.Clock();

  // ground
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshPhongMaterial({ color: 0xffffff, depthWrite: false })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  scene.add(mesh);

  const animate = () => {
    // const delta = clock.getDelta();
    // if ( mixer ) mixer.update( delta );
    orbitControls?.enabled && orbitControls.update();
    renderer!.render(scene, camera);
    stats.update();
  };

  let renderer = _renderer;
  if (!renderer) {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
  }

  let orbitControls = _orbitControls;
  if (!orbitControls) {
    orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.1;
  }

  window.addEventListener('resize', onWindowResize);

  // stats
  const stats = new Stats();
  container.appendChild(stats.dom);

  function onWindowResize() {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.aspect = window.innerWidth / window.innerHeight;
    }
    camera?.updateProjectionMatrix();
    renderer?.setSize(window.innerWidth, window.innerHeight);
  }

  const cleanUp = () => {
    window.removeEventListener('resize', onWindowResize);
    container.removeChild(renderer.domElement);
    container.removeChild(stats.dom);
    container.remove();
    renderer.dispose();
    scene.clear();
  };

  // updateInspector can be called multiple times with different options except scene which can only be set once
  const { updateInspector, unmountInspector } = injectInspector({
    camera,
    scene,
    renderer,
    frameloop,
    autoNavControls,
    customParams,
    // for testing
    onCPanelUnmounted,
    onCPanelReady,
    onThreeChange,
    onSetupEffect
  });

  return {
    scene,
    camera,
    dirLight,
    // hemiLight,
    renderer,
    clock,
    orbitControls,
    updateInspector,
    unmountInspector,
    cleanUp
  };
}

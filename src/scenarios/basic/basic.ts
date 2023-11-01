import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
// import gsap from 'gsap';

const cursor = {
  x: 0,
  y: 0
};
window.addEventListener('mousemove', (evt) => {
  cursor.x = evt.clientX / sizes.width - 0.5;
  cursor.y = -(evt.clientY / sizes.height - 0.5);
});

const scene = new THREE.Scene();

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0xff0000 })
);
cube.position.set(0, 0, 0);
scene.add(cube);

const sizes = {
  width: 800,
  height: 600
};
const aspectRatio = sizes.width / sizes.height;
const camera = new THREE.PerspectiveCamera(75, aspectRatio, 1, 100);
// const camera = new THREE.OrthographicCamera(
//   -1 * aspectRatio,
//   1 * aspectRatio,
//   1,
//   -1,
//   1,
//   100
// );
camera.position.set(0, 0, 3);
// camera.lookAt(cube.position);
scene.add(camera);

const axisHelper = new THREE.AxesHelper(100);
scene.add(axisHelper);

const canvas = document.querySelector('canvas.webgl')!;
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true
});
renderer.setSize(sizes.width, sizes.height);

const orbitControls = new OrbitControls(camera, canvas);
orbitControls.enableDamping = true;

const transformControls = new TransformControls(camera, canvas);
transformControls.attach(cube);
transformControls.setSpace('local'); // local | world
transformControls.addEventListener('dragging-changed', function (event: any) {
  orbitControls.enabled = !event.value;
});
scene.add(transformControls);

// const clock = new THREE.Clock();
const tick = () => {
  // const delta = clock.getDelta();
  // cube.rotation.y += delta * 0.5;

  // camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 3;
  // camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 3;
  // camera.position.y = cursor.y * 10;

  orbitControls.update();

  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};
tick();

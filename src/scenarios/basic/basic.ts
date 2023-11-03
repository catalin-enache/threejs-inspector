/* eslint-disable @typescript-eslint/no-unused-vars */
import * as THREE from 'three';
import { config } from '../../config';
import { init } from '../../scene';

config.cameraType = 'orthographic';
config.controlsAreaWidth = 300;
config.orthographicCameraRatio = 400;
config.handleMouseMove = handleMouseMove;
config.handleResize = handleResize;
config.handleHit = handleHit;
config.handleClick = handleClick;

const {
  scene,
  transformControls,
  loop,
  pointer,
  sceneSize,
  getCamera,
  getHit
} = init(config);
function handleMouseMove(cursor: typeof pointer) {
  // console.log(pointer);
}

function handleClick(cursor: typeof pointer) {
  const hit = getHit();
  // console.log(getHit());
  transformControls.attach(hit?.object);
  // switchCamera();
}

function handleResize(size: typeof sceneSize) {
  // console.log(size);
}
function handleHit(
  hit: THREE.Intersection<THREE.Object3D<THREE.Object3DEventMap>>
) {
  // console.log(hit);
}

const cube1 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0xff0000 })
);
config.interactiveObjects.push(cube1);
cube1.name = 'cube1';
cube1.position.set(0, 0, 0);
scene.add(cube1);

const cube2 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0x00ff00 })
);
config.interactiveObjects.push(cube2);
cube2.name = 'cube2';
cube2.position.set(2, 0, 0);
scene.add(cube2);

const tick = () => {
  // console.log(pointer);
  // console.log(getHit())
  const camera = getCamera();
  console.log(camera.position.length(), camera.zoom);
};
loop(tick);

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as THREE from 'three';
import { config } from '../../config';
import { init } from '../../scene';

// config.cameraType = 'orthographic';
// config.controlsAreaWidth = 350;
config.orthographicCameraRatio = 400;
config.handleMouseMove = handleMouseMove;
config.handleResize = handleResize;
config.handleHit = handleHit;
config.handleClick = handleClick;

const sceneObjects = init(config);
export const getSceneObjects = () => sceneObjects;

const {
  scene,
  getTransformControls,
  loop,
  pointer,
  sceneSize,
  getCamera,
  getHit
} = sceneObjects;

function handleMouseMove(cursor: typeof pointer) {
  // console.log(pointer);
}

function handleClick(cursor: typeof pointer) {
  //  console.log(cursor);
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
  // console.log(getCamera().position.length(), getCamera().zoom);
};
loop(tick);

/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as THREE from 'three';

export type SceneSize = {
  width: number;
  height: number;
};

export type Config = {
  controlsAreaWidth: number;
  cameraType: 'perspective' | 'orthographic';
  orthographicCameraRatio: number;
  handleMouseMove(pointer: THREE.Vector2): void;
  handleClick(pointer: THREE.Vector2): void;
  handleResize(sizes: SceneSize): void;
  handleHit(
    hit: THREE.Intersection<THREE.Object3D<THREE.Object3DEventMap>> | null
  ): void;
  interactiveObjects: THREE.Object3D[];
};

export const config: Config = {
  controlsAreaWidth: 330,
  cameraType: 'perspective',
  orthographicCameraRatio: 300,
  handleMouseMove() {},
  handleClick() {},
  handleResize() {},
  handleHit() {},
  interactiveObjects: [] as THREE.Object3D[]
};

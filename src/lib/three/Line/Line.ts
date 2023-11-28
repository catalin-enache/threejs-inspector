import * as THREE from 'three';
import { Destroyable, InternalContinuousUpdate, UserData } from 'src/types';

export class Line
  extends THREE.Line
  implements InternalContinuousUpdate, Destroyable
{
  public p1: THREE.Object3D;
  public p2: THREE.Object3D;
  constructor(p1: THREE.Object3D, p2: THREE.Object3D, color: number) {
    const material = new THREE.LineBasicMaterial({ color });
    const p1_position = new THREE.Vector3();
    const p2_position = new THREE.Vector3();
    p1.getWorldPosition(p1_position);
    p2.getWorldPosition(p2_position);
    const geometry = new THREE.BufferGeometry().setFromPoints([
      p1_position,
      p2_position
    ]);
    super(geometry, material);
    const p1_userData = p1.userData as UserData;
    const p2_userData = p2.userData as UserData;
    if (!p1_userData.dependants) {
      p1_userData.dependants = {};
    }
    if (!p2_userData.dependants) {
      p2_userData.dependants = {};
    }
    p1_userData.dependants[this.uuid] = this;
    p2_userData.dependants[this.uuid] = this;
    this.p1 = p1;
    this.p2 = p2;
  }

  internalContinuousUpdate() {
    const p1_position = new THREE.Vector3();
    const p2_position = new THREE.Vector3();
    this.p1.getWorldPosition(p1_position);
    this.p2.getWorldPosition(p2_position);
    this.geometry.setFromPoints([p1_position, p2_position]);
  }

  onDestroy() {
    const p1_userData = this.p1.userData as UserData;
    const p2_userData = this.p2.userData as UserData;
    if (p1_userData.dependants) {
      delete p1_userData.dependants[this.uuid];
    }
    if (p2_userData.dependants) {
      delete p2_userData.dependants[this.uuid];
    }
  }
}

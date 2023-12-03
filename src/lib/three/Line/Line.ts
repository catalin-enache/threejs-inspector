import * as THREE from 'three';
import type {
  LiveCycle,
  InternalContinuousUpdate,
  UserData,
  InfoOptions
} from 'src/types';
import type { SceneObjects } from 'src/scene';
import { Point } from 'lib/three/Point';

export class Line
  extends THREE.Line
  implements InternalContinuousUpdate, LiveCycle
{
  public p1: THREE.Object3D;
  public p2: THREE.Object3D;
  public line3: THREE.Line3;
  private readonly _centerPoint: Point;
  private _p1_position = new THREE.Vector3();
  private _p2_position = new THREE.Vector3();
  private _center = new THREE.Vector3();
  private _sceneObjects?: SceneObjects;
  private _deltaVector = new THREE.Vector3();
  private _infoOptions: InfoOptions;
  constructor(
    p1: THREE.Object3D,
    p2: THREE.Object3D,
    color: number,
    options: InfoOptions = {}
  ) {
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
    this.p1 = p1;
    this.p2 = p2;
    this.line3 = new THREE.Line3(p1_position, p2_position);
    this._infoOptions = options;
    this._centerPoint = new Point(0xffffff, 0);
    this._centerPoint.name = this.uuid + '_middlePoint';
    this.line3.getCenter(this._center);
    this._centerPoint.position.copy(this._center);
  }

  internalContinuousUpdate() {
    this.p1.getWorldPosition(this._p1_position);
    this.p2.getWorldPosition(this._p2_position);
    this.geometry.setFromPoints([this._p1_position, this._p2_position]);
    this.line3.set(this._p1_position, this._p2_position);
    this.line3.getCenter(this._center);
    this._centerPoint.position.copy(this._center);
    this.line3.delta(this._deltaVector);

    const distanceInfo = `dist : ${this.line3.distance().toFixed(2)}`;

    const deltaInfo = `delta: x: ${this._deltaVector.x.toFixed(
      2
    )}\n       y: ${this._deltaVector.y.toFixed(
      2
    )}\n       z: ${this._deltaVector.z.toFixed(2)}`;

    const info: string[] = [];

    if (this._infoOptions.distance) {
      info.push(distanceInfo);
    }
    if (this._infoOptions.delta) {
      info.push(deltaInfo);
    }

    this._sceneObjects?.changeScreenInfoValue(
      this._centerPoint.name,
      info.join('\n')
    );
  }

  onAdded({ sceneObjects, scene }: Parameters<LiveCycle['onAdded']>[0]) {
    this._sceneObjects = sceneObjects;
    const p1_userData = this.p1.userData as UserData;
    const p2_userData = this.p2.userData as UserData;
    if (!p1_userData.dependants) {
      p1_userData.dependants = {};
    }
    if (!p2_userData.dependants) {
      p2_userData.dependants = {};
    }
    p1_userData.dependants[this.uuid] = this;
    p2_userData.dependants[this.uuid] = this;
    scene.add(this._centerPoint);
    const infoColor = '#' + (this._infoOptions.color || 0xffffff).toString(16);
    sceneObjects.addScreenInfo({
      linkObject: this._centerPoint,
      name: this._centerPoint.name,
      value: '?',
      position: { x: 0, y: 0 },
      // size: { width: 40, height: 40 },
      color: {
        bg: 'rgba(0,0,0,0)',
        fg: infoColor
      }
    });
  }

  onRemoved({ scene }: Parameters<LiveCycle['onRemoved']>[0]) {
    scene.remove(this._centerPoint);
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

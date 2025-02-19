import * as THREE from 'three';
import { useAppStore } from 'src/store';

export class Follower extends THREE.Mesh {
  target: THREE.Object3D;
  size: number;
  _v1: THREE.Vector3;

  constructor(
    target: THREE.Object3D,
    { geometry, material, size }: { geometry?: THREE.BufferGeometry; material?: THREE.Material; size?: number } = {}
  ) {
    super();
    this.target = target;
    this.size = size ?? useAppStore.getState().gizmoSize;
    this.matrixAutoUpdate = false;
    this.matrixWorldNeedsUpdate = false;
    this.geometry = geometry ?? this.makeGeometry();
    this.material = material ?? this.makeMaterial();
    // @ts-ignore
    this.type = 'Follower';
    this._v1 = new THREE.Vector3();
    this.update();
  }

  makeGeometry(): THREE.BufferGeometry {
    return new THREE.BoxGeometry(this.size, this.size, this.size);
  }

  makeMaterial(): THREE.Material {
    return new THREE.MeshBasicMaterial({
      color:
        (this.target as THREE.Light).color || // camera doesn't have color
        (this.target instanceof THREE.Camera ? new THREE.Color(0xff0000) : new THREE.Color(0xcccccc)),
      visible: true,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 1,
      fog: false,
      toneMapped: false,
      wireframe: true
    });
  }

  update() {
    this.target.updateWorldMatrix(true, false);

    if (this.parent) {
      this.parent.updateWorldMatrix(true, false);
      this.matrix.copy(this.parent.matrixWorld).invert().multiply(this.target.matrixWorld);
    } else {
      this.matrix.copy(this.target.matrixWorld);
    }

    this.matrixWorld.copy(this.target.matrixWorld);

    this.matrix.decompose(this.position, this.quaternion, this.scale);
    this.updateMatrixWorld(true);

    if ((this.target as THREE.SpotLight).target) {
      (this.target as THREE.SpotLight).target.updateWorldMatrix(true, false);
      this._v1.setFromMatrixPosition((this.target as THREE.SpotLight).target.matrixWorld);
      this.lookAt(this._v1);
      this.updateMatrix();
      this.updateWorldMatrix(true, false);
    }

    if ((this.material as THREE.MeshBasicMaterial)?.color && (this.target as THREE.Light).color) {
      (this.material as THREE.MeshBasicMaterial)?.color.copy((this.target as THREE.Light).color);
    }
  }

  dispose() {
    this.geometry.dispose();
    const materials = Array.isArray(this.material) ? this.material : [this.material];
    materials.forEach((material) => {
      material.dispose();
      // If any textures in teh material, they belong to the owner which should take care of disposing them
    });
  }

  raycast(raycaster: THREE.Raycaster, intersects: THREE.Intersection[]) {
    // console.log('raycast', raycaster, intersects);
    return super.raycast(raycaster, intersects);
  }
}

export class EmptyFollower extends Follower {
  constructor(target: THREE.Object3D) {
    super(target);
    // @ts-ignore
    this.type = 'EmptyFollower';
  }

  makeMaterial() {
    return new THREE.MeshBasicMaterial();
  }

  makeGeometry(): THREE.BufferGeometry {
    return new THREE.BufferGeometry();
  }
}

// NOTE: CubeCamera when selected, triggers TexturePlugin which makes a CanvasTexture for it.
// That CanvasTexture remains behind when CubeCamera is deleted and uploaded back.
// When CanvasTexture is removed it is added back right away when some other object in the scene
// uses one of the custom shaders used by TexturePlugin.
// If those custom shaders need to be used in some scene texture they should be cloned and not used directly.
export class CubeCameraHelper extends Follower {
  constructor(target: THREE.Object3D, { size }: { size?: number } = {}) {
    super(target, { size });
    // @ts-ignore
    this.type = 'CubeCameraHelper';
  }

  makeMaterial() {
    return new THREE.MeshLambertMaterial({
      color: 0xffffff,
      envMap: (this.target as THREE.CubeCamera).renderTarget.texture
    });
    // return new THREE.MeshBasicMaterial({ map: (this.target as THREE.CubeCamera).renderTarget.texture });
  }
}

export class CubeCameraPicker extends Follower {
  constructor(target: THREE.Object3D, { size }: { size?: number } = {}) {
    super(target, { size });
    // @ts-ignore
    this.type = 'CubeCameraPicker';
  }
}

export class DirectionalLightPicker extends Follower {
  constructor(target: THREE.Object3D, { size }: { size?: number } = {}) {
    super(target, { size });
    // @ts-ignore
    this.type = 'DirectionalLightPicker';
  }

  makeGeometry(): THREE.BufferGeometry {
    return new THREE.PlaneGeometry(this.size * 4, this.size * 4);
  }
}

export class RectAreaLightPicker extends Follower {
  constructor(target: THREE.Object3D, { size }: { size?: number } = {}) {
    super(target, { size });
    // @ts-ignore
    this.type = 'RectAreaLightPicker';
  }

  makeGeometry(): THREE.BufferGeometry {
    return new THREE.PlaneGeometry(
      (this.target as THREE.RectAreaLight).width,
      (this.target as THREE.RectAreaLight).height
    );
  }

  update() {
    this.geometry.dispose();
    this.geometry = new THREE.PlaneGeometry(
      (this.target as THREE.RectAreaLight).width,
      (this.target as THREE.RectAreaLight).height
    );
    super.update();
  }
}

export class PointLightPicker extends Follower {
  constructor(target: THREE.Object3D, { size }: { size?: number } = {}) {
    super(target, { size });
    // @ts-ignore
    this.type = 'PointLightPicker';
  }

  makeGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.SphereGeometry(this.size, 4, 1);
    const tmpObj = new THREE.Mesh(geometry);
    tmpObj.rotateY(Math.PI / 180);
    tmpObj.updateMatrix();
    geometry.applyMatrix4(tmpObj.matrix);
    tmpObj.rotation.set(0, 0, 0);
    tmpObj.position.set(0, 0, 0);
    tmpObj.scale.set(1, 1, 1);
    return geometry;
  }
}

export class LightProbePicker extends Follower {
  constructor(target: THREE.Object3D, { size }: { size?: number } = {}) {
    super(target, { size });
    // @ts-ignore
    this.type = 'LightProbePicker';
  }

  makeGeometry(): THREE.BufferGeometry {
    return new THREE.SphereGeometry(this.size, 6, 6);
  }
}

export class SpotLightPicker extends Follower {
  constructor(target: THREE.Object3D, { size }: { size?: number } = {}) {
    super(target, { size });
    // @ts-ignore
    this.type = 'SpotLightPicker';
  }

  makeGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.ConeGeometry(this.size * 2, this.size * 2, 4);
    const tmpObj = new THREE.Mesh(geometry);
    tmpObj.rotateX(-Math.PI / 2);
    tmpObj.updateMatrix();
    tmpObj.translateY(-0.5);
    tmpObj.updateMatrix();
    geometry.applyMatrix4(tmpObj.matrix);
    tmpObj.rotation.set(0, 0, 0);
    tmpObj.position.set(0, 0, 0);
    tmpObj.scale.set(1, 1, 1);
    return geometry;
  }
}

export class CameraPicker extends Follower {
  constructor(target: THREE.Object3D, { size }: { size?: number } = {}) {
    super(target, { size });
    // @ts-ignore
    this.type = 'CameraPicker';
  }

  makeGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.ConeGeometry(this.size * 2, this.size * 2, 8);
    const tmpObj = new THREE.Mesh(geometry);
    tmpObj.rotateX(Math.PI / 2);
    tmpObj.updateMatrix();
    tmpObj.translateY(-0.5);
    tmpObj.updateMatrix();
    geometry.applyMatrix4(tmpObj.matrix);
    tmpObj.rotation.set(0, 0, 0);
    tmpObj.position.set(0, 0, 0);
    tmpObj.scale.set(1, 1, 1);
    return geometry;
  }
}

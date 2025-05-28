import * as THREE from 'three';
import 'src/lib/patchRenderTarget';
import type { CubeCameraAsJson } from 'src/tsExtensions';

THREE.CubeCamera.prototype.toJSON = (function () {
  return function (this: THREE.CubeCamera, meta?: THREE.JSONMeta): CubeCameraAsJson {
    const children = [...this.children];
    // removing internal cameras
    while (this.children.length) {
      this.remove(this.children[0]);
    }
    const _data: THREE.Object3DJSON = THREE.Object3D.prototype.toJSON.call(this, meta);
    const data = _data as CubeCameraAsJson;
    const { near, far } = children[0] as THREE.PerspectiveCamera;
    data.object.near = near;
    data.object.far = far;
    data.object.renderTarget = this.renderTarget.toJSON(meta);
    this.children = children;
    return data;
  };
})();

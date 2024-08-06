import * as THREE from 'three';
import type { __inspectorData } from 'tsExtensions';

if (!Object.getPrototypeOf(THREE.Object3D.prototype).__inspectorData) {
  Object.defineProperty(THREE.Object3D.prototype, '__inspectorData', {
    get: function () {
      if (!this._innerInspectorData) {
        const __inspectorData: Partial<__inspectorData> = {};
        const scope = this;
        Object.defineProperty(__inspectorData, 'isInspectable', {
          get: () => {
            // console.log('isInspectable getter called', scope.name || scope.type || scope.uuid);
            return this._isInspectable;
          },
          set: (value) => {
            this._isInspectable = value;
            scope.children.forEach((child: THREE.Object3D) => {
              child.__inspectorData.isInspectable = value;
              // only need hitRedirect on descendants if it's not set, not on root
              if (!child.__inspectorData.hitRedirect) {
                child.__inspectorData.hitRedirect = this;
              }
            });
          },
          configurable: true
        });
        Object.defineProperty(__inspectorData, 'hitRedirect', {
          get: () => {
            // console.log('hitRedirect getter called', scope.name || scope.type || scope.uuid);
            return this._hitRedirect;
          },
          set: (value) => {
            this._hitRedirect = value;
            scope.children.forEach((child: THREE.Object3D) => {
              child.__inspectorData.hitRedirect = value;
            });
          },
          configurable: true
        });
        Object.defineProperty(__inspectorData, 'dependantObjects', {
          get: () => {
            if (!this._dependantObjects) this._dependantObjects = [];
            return this._dependantObjects;
          },
          configurable: true
        });
        this._innerInspectorData = __inspectorData;
      }
      return this._innerInspectorData;
    },
    set: function (value) {
      Object.assign(this._innerInspectorData, value);
    },
    configurable: true
  });
}

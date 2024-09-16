import * as THREE from 'three';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper';
import { LightProbeHelper } from 'three/examples/jsm/helpers/LightProbeHelper';
import { PositionalAudioHelper } from 'three/examples/jsm/helpers/PositionalAudioHelper';
import { refreshOutliner } from 'lib/third_party/outlinerHelpers';
import { useAppStore } from 'src/store';
import { offlineScene } from 'lib/App/CPanel/offlineScene';
import type { __inspectorData } from 'tsExtensions';

if (!Object.getPrototypeOf(THREE.Object3D.prototype).__inspectorData) {
  Object.defineProperty(THREE.Object3D.prototype, '__inspectorData', {
    get: function () {
      if (!this._innerInspectorData) {
        const __inspectorData: Partial<__inspectorData> = {};
        // eslint-disable-next-line @typescript-eslint/no-this-alias
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

// Be aware: the patch applies to the internal scene of TexturePlugin too.
THREE.Object3D.prototype.add = (function () {
  const originalAdd = THREE.Object3D.prototype.add;
  return function (this: THREE.Object3D, ...objects: THREE.Object3D[]) {
    originalAdd.call(this, ...objects);
    objects.forEach((object) => {
      if (module.isSceneObject(this)) {
        // console.log('Is scene object already', this.name || this.type || this.uuid, this);
        object.traverse((descendant) => {
          module.handleObjectAdded(descendant);
        });
        refreshOutliner({ scene: module.currentScene });
      } else if (module.isMainScene(this)) {
        object.traverse((descendant) => {
          module.handleObjectAdded(descendant);
        });
        refreshOutliner({ scene: module.currentScene });
      }
      // The last branch here would be if we add to a non-scene object.
      // In that case, we don't need to do anything.
      // It will be handled when it gets added to the scene in the second branch.
    });

    return this;
  };
})();

THREE.Object3D.prototype.remove = (function () {
  const originalRemove = THREE.Object3D.prototype.remove;
  return function (this: THREE.Object3D, ...objects: THREE.Object3D[]) {
    const _isSceneObject = objects.some(module.isSceneObject);
    // things to skip
    if (this instanceof THREE.CubeCamera) {
      // skip children cameras of a cubeCamera
      return originalRemove.call(this, ...objects);
    }
    objects.forEach((object) => {
      module.cleanupAfterRemovedObject(object);
      if (object === useAppStore.getState().getSelectedObject()) {
        useAppStore.getState().setSelectedObject(null);
      }
    });
    originalRemove.call(this, ...objects);

    if (_isSceneObject) {
      refreshOutliner({ scene: module.currentScene });
    }
    return this;
  };
})();

// ==============================================================================

const defaultScene = new THREE.Scene();
const cameraPosition = new THREE.Vector3(0, 0, 12);
const defaultPerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
defaultPerspectiveCamera.position.copy(cameraPosition);
defaultPerspectiveCamera.zoom = 1;
defaultPerspectiveCamera.name = 'DefaultPerspectiveCamera';

const defaultOrthographicCamera = new THREE.OrthographicCamera(-0, 0, 0, -0, 0.1, 10000);
defaultOrthographicCamera.position.copy(cameraPosition);
defaultOrthographicCamera.zoom = 45;
defaultOrthographicCamera.name = 'DefaultOrthographicCamera';

type Module = {
  currentScene: THREE.Scene;
  getCurrentScene: () => THREE.Scene;
  setCurrentScene: (scene: THREE.Scene) => void;
  interactableObjects: Record<string, THREE.Object3D>;
  updateCameras: () => void;
  defaultPerspectiveCamera: THREE.PerspectiveCamera;
  defaultOrthographicCamera: THREE.OrthographicCamera;
  cameraToUseOnPlay: THREE.PerspectiveCamera | THREE.OrthographicCamera | null;
  getCameraToUseOnPlay: () => THREE.PerspectiveCamera | THREE.OrthographicCamera | null;
  getIsPlayingCamera: (camera: THREE.Camera) => boolean;
  objectHasSkeleton: (object: THREE.Object3D) => boolean;
  shouldContainItsHelper: (object: THREE.Object3D) => boolean;
  makeHelpers: (object: THREE.Object3D) => void;
  isSceneObject: (object: THREE.Object3D) => boolean;
  isMainScene: (scene: any) => boolean;
  handleObjectAdded: (object: THREE.Object3D) => void;
  destroy: (object: any) => void;
  cleanupAfterRemovedObject: (object: THREE.Object3D) => void;
  subscriptions: Record<string, (() => void)[]>;
};

const module: Module = {
  currentScene: defaultScene,
  getCurrentScene() {
    return this.currentScene;
  },
  setCurrentScene(scene: THREE.Scene) {
    this.currentScene = scene;
  },
  interactableObjects: {},
  subscriptions: {},
  // ----------------------------------- Cameras >> -----------------------------------

  defaultPerspectiveCamera,
  defaultOrthographicCamera,
  cameraToUseOnPlay: null,
  getCameraToUseOnPlay() {
    return this.cameraToUseOnPlay;
  },

  updateCameras() {
    defaultPerspectiveCamera.aspect = window.innerWidth / window.innerHeight;
    defaultPerspectiveCamera.updateProjectionMatrix();

    defaultOrthographicCamera.left = window.innerWidth / -2;
    defaultOrthographicCamera.right = window.innerWidth / 2;
    defaultOrthographicCamera.top = window.innerHeight / 2;
    defaultOrthographicCamera.bottom = window.innerHeight / -2;
    defaultOrthographicCamera.updateProjectionMatrix();

    // update cameraToUseOnPlay knowledge about window re-size that might happened before play
    if (this.cameraToUseOnPlay instanceof THREE.PerspectiveCamera) {
      this.cameraToUseOnPlay.aspect = defaultPerspectiveCamera.aspect;
      this.cameraToUseOnPlay.updateProjectionMatrix();
    } else if (this.cameraToUseOnPlay instanceof THREE.OrthographicCamera) {
      this.cameraToUseOnPlay.left = defaultOrthographicCamera.left;
      this.cameraToUseOnPlay.right = defaultOrthographicCamera.right;
      this.cameraToUseOnPlay.top = defaultOrthographicCamera.top;
      this.cameraToUseOnPlay.bottom = defaultOrthographicCamera.bottom;
      this.cameraToUseOnPlay.updateProjectionMatrix();
    }
  },

  getIsPlayingCamera(camera: THREE.Camera): boolean {
    return !!camera.__inspectorData.useOnPlay;
  },

  // ----------------------------------- << Cameras -----------------------------------

  isSceneObject(object: THREE.Object3D) {
    // traverse up to the scene
    let parent = object.parent;
    while (parent && !(parent instanceof THREE.Scene)) {
      parent = parent.parent;
    }
    // we have another offline scene in TexturePlugin
    return parent !== null && parent !== offlineScene;
  },

  isMainScene(scene: any) {
    return scene instanceof THREE.Scene && scene !== offlineScene;
  },

  objectHasSkeleton(object: THREE.Object3D) {
    let hasSkeleton = false;
    object.traverse((descendant) => {
      if (descendant instanceof THREE.SkinnedMesh) {
        hasSkeleton = true;
      }
    });
    return hasSkeleton;
  },

  shouldContainItsHelper(object: THREE.Object3D) {
    return [THREE.PositionalAudio].some((Type) => object instanceof Type);
  },

  makeHelpers(object: THREE.Object3D) {
    const hasSkeleton = this.objectHasSkeleton(object);

    if (
      !(
        object instanceof THREE.Light ||
        object instanceof THREE.Camera ||
        object instanceof THREE.CubeCamera ||
        object instanceof THREE.PositionalAudio ||
        hasSkeleton
      )
    )
      return;
    // console.log('Making helpers for', object.name || object.type || object.uuid, object);
    if (hasSkeleton) {
      // console.log('has skeleton', object.name || object.type || object.uuid, object);
    }

    // we don't need pickers for meshes
    const pickerIsNeeded = !hasSkeleton;

    const helperSize = useAppStore.getState().gizmoSize;
    // TODO: check other included helpers (e.g. OctreeHelper)
    const helper: THREE.Object3D['__inspectorData']['helper'] = hasSkeleton
      ? new THREE.SkeletonHelper(object)
      : object instanceof THREE.Camera
        ? new THREE.CameraHelper(object)
        : object instanceof THREE.RectAreaLight
          ? new RectAreaLightHelper(object)
          : object instanceof THREE.DirectionalLight
            ? new THREE.DirectionalLightHelper(object, helperSize * 2)
            : object instanceof THREE.SpotLight
              ? new THREE.SpotLightHelper(object)
              : object instanceof THREE.HemisphereLight
                ? new THREE.HemisphereLightHelper(object, helperSize)
                : object instanceof THREE.LightProbe
                  ? new LightProbeHelper(object, helperSize)
                  : object instanceof THREE.PointLight
                    ? new THREE.PointLightHelper(object as THREE.PointLight, helperSize)
                    : object instanceof THREE.CubeCamera
                      ? new THREE.Mesh()
                      : object instanceof THREE.PositionalAudio
                        ? new PositionalAudioHelper(object as THREE.PositionalAudio, helperSize)
                        : new THREE.Mesh(); // meaningless helper

    helper.name = `helper for ${object.name || object.type || ''} ${object.uuid}`;
    helper.__inspectorData.isHelper = true;

    const pickerGeometry =
      object instanceof THREE.DirectionalLight
        ? new THREE.PlaneGeometry(helperSize * 4, helperSize * 4)
        : object instanceof THREE.RectAreaLight
          ? new THREE.PlaneGeometry(object.width, object.height)
          : object instanceof THREE.SpotLight
            ? new THREE.ConeGeometry(helperSize * 2, 1, 4)
            : object instanceof THREE.Camera
              ? new THREE.ConeGeometry(helperSize * 2, 1, 8)
              : object instanceof THREE.PointLight
                ? new THREE.SphereGeometry(helperSize, 4, 1)
                : object instanceof THREE.CubeCamera
                  ? new THREE.BoxGeometry(helperSize, helperSize, helperSize)
                  : new THREE.BoxGeometry(helperSize, helperSize, helperSize); // generic mesh geometry

    const picker: THREE.Mesh = new THREE.Mesh(
      pickerGeometry,
      new THREE.MeshBasicMaterial({
        color:
          (object as THREE.Light).color || // camera doesn't have color
          (object instanceof THREE.Camera ? new THREE.Color(0xff0000) : new THREE.Color(0xcccccc)),
        visible: true,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.1,
        fog: false,
        toneMapped: false,
        wireframe: true
      })
    );

    picker.name = `picker for ${object.name || object.type || ''} ${object.uuid}`;

    if (object instanceof THREE.SpotLight) {
      // Temporarily adjust picker transform and bake that in geometry since original cone geometry is not aligned as needed
      picker.rotateX(-Math.PI / 2);
      picker.updateMatrix();
      picker.translateY(-0.5);
      picker.updateMatrix();
      picker.geometry.applyMatrix4(picker.matrix);
      picker.rotation.set(0, 0, 0);
      picker.position.set(0, 0, 0);
      picker.scale.set(1, 1, 1);
    } else if (object instanceof THREE.Camera) {
      // Temporarily adjust picker transform and bake that in geometry since original cone geometry is not aligned as needed
      picker.rotateX(Math.PI / 2);
      picker.updateMatrix();
      picker.translateY(-0.5);
      picker.updateMatrix();
      picker.geometry.applyMatrix4(picker.matrix);
      picker.rotation.set(0, 0, 0);
      picker.position.set(0, 0, 0);
      picker.scale.set(1, 1, 1);
    } else if (object instanceof THREE.DirectionalLight) {
      picker.matrix = (helper as THREE.DirectionalLightHelper).lightPlane.matrix; // helper.matrix is a reference to helper.light.matrixWorld
      picker.matrixAutoUpdate = false;
    }
    const objectInspectorData = object.__inspectorData;
    const pickerInspectorData = picker.__inspectorData;
    pickerIsNeeded && (objectInspectorData.picker = picker);
    objectInspectorData.helper = helper;
    pickerInspectorData.hitRedirect = object;
    pickerInspectorData.isPicker = true;

    pickerIsNeeded && object.add(picker);
    pickerIsNeeded && object.__inspectorData.dependantObjects!.push(picker);
    object.__inspectorData.dependantObjects!.push(helper);

    if (object instanceof THREE.SpotLight) {
      picker.lookAt(object.target.position);
    }

    // helper is added to the scene in handleObjectAdded function except helpers for these object types
    if (this.shouldContainItsHelper(object)) {
      object.add(helper);
    }

    this.subscriptions[object.uuid] = this.subscriptions[object.uuid] || [];

    this.subscriptions[object.uuid].push(
      useAppStore.subscribe(
        (appStore) => appStore.selectedObjectStateFake,
        () => {
          if (object instanceof THREE.Light) {
            // @ts-ignore
            object.color && picker.material.color.copy(object.color);
          }
          if (object instanceof THREE.SpotLight) {
            picker.lookAt(object.target.position);
          } else if (object instanceof THREE.RectAreaLight) {
            picker.geometry.dispose();
            picker.geometry = new THREE.PlaneGeometry(object.width, object.height);
          }
        }
      )
    );

    const showHelpers = useAppStore.getState().showHelpers;
    const showGizmos = useAppStore.getState().showGizmos;
    helper.visible = showGizmos && showHelpers;
    picker.visible = showGizmos;

    this.subscriptions[object.uuid].push(
      useAppStore.subscribe(
        (appStore) => appStore.showGizmos,
        (showGizmos) => {
          helper.visible = showGizmos;
          picker.visible = showGizmos;
        }
      )
    );

    this.subscriptions[object.uuid].push(
      useAppStore.subscribe(
        (appStore) => appStore.showHelpers && appStore.showGizmos,
        (showHelpers) => {
          helper.visible = showHelpers;
        }
      )
    );

    this.subscriptions[object.uuid].push(
      useAppStore.subscribe(
        (appStore) => appStore.playingState,
        (playingState) => {
          // we don't need to remove helpers for default cameras since R3F does not add cameras to scene
          if (objectInspectorData.useOnPlay) {
            if (['playing', 'paused'].includes(playingState)) {
              pickerIsNeeded && object.remove(picker);
              this.currentScene.remove(helper);
            } else {
              pickerIsNeeded && object.add(picker);
              this.interactableObjects[picker.uuid] = picker;
              this.currentScene.add(helper);
            }
          }
        }
      )
    );
  },

  destroy(object: any) {
    if ('dispose' in object) {
      object.dispose(); // for helpers
    } else if (object instanceof THREE.Mesh) {
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((mat: THREE.Material) => {
        Object.keys(mat).forEach((key) => {
          if ((mat as any)[key] instanceof THREE.Texture) {
            (mat as any)[key].dispose(); // texture dispose
          }
        });
        mat.dispose(); // material dispose
      });
      object.geometry?.dispose(); // geometry dispose
    }
  },

  cleanupAfterRemovedObject(object: THREE.Object3D) {
    object.traverse((child) => {
      if (this.currentScene.__inspectorData.transformControlsRef?.current?.object === child) {
        this.currentScene.__inspectorData.transformControlsRef.current.detach();
      }

      // TODO: continue unit testing here
      // unsubscribe
      while (this.subscriptions[child.uuid]?.length) {
        this.subscriptions[child.uuid].pop()!();
      }

      while (child.__inspectorData.dependantObjects!.length) {
        const dependantObject = child.__inspectorData.dependantObjects!.pop()!;
        dependantObject.removeFromParent();
        this.destroy(dependantObject);
      }

      // No need to destroy everything, geometries and materials might be reused
      const destroyOnRemove = useAppStore.getState().destroyOnRemove;
      if (
        (destroyOnRemove || child.__inspectorData.isPicker) &&
        child.__inspectorData.hitRedirect !== this.cameraToUseOnPlay
      ) {
        // helpers and pickers for cameraToUseOnPlay needs to stay around (TODO: find out the reason for this requirement)
        // TODO: investigate. Renderer Info reports that geometries and textures are less (cleaned up to some extent)
        // but memory (reported by Stats) is not released.
        this.destroy(child);
      }

      delete this.interactableObjects[child.uuid];

      if (this.cameraToUseOnPlay === child) {
        this.cameraToUseOnPlay = null;
      }
    });
  },

  // called for every child of an object only when added to the scene
  handleObjectAdded(object: THREE.Object3D) {
    const __inspectorData = object.__inspectorData;
    if (
      __inspectorData.isInspectable ||
      (object as THREE.Light).isLight ||
      (object as THREE.Camera).isCamera ||
      object instanceof THREE.CubeCamera ||
      object instanceof THREE.PositionalAudio
    ) {
      // R3F does not add cameras to scene, so this check is not needed, but checking just in case
      if (
        object !== defaultPerspectiveCamera &&
        object !== defaultOrthographicCamera &&
        !(object.parent instanceof THREE.CubeCamera)
      ) {
        this.makeHelpers(object); // will enrich certain objects with helper and picker
      }
      if (
        (object instanceof THREE.PerspectiveCamera || object instanceof THREE.OrthographicCamera) &&
        __inspectorData.useOnPlay
      ) {
        // if multiple cameras are useOnPlay, only the last one will be considered
        this.cameraToUseOnPlay = object as THREE.PerspectiveCamera | THREE.OrthographicCamera;
        // current camera did not change just yet, only cameraToUseOnPlay is updated
      }
      // picker appears in __inspectorData after makeHelpers is called
      if (__inspectorData.picker) {
        this.interactableObjects[__inspectorData.picker.uuid] = __inspectorData.picker;
      } else {
        this.interactableObjects[object.uuid] = object;
      }
      // most helpers are added to the scene but some are added to the object itself (e.g. PositionalAudioHelper)
      if (__inspectorData.helper && !this.shouldContainItsHelper(object)) {
        this.currentScene.add(__inspectorData.helper);
      }
    }
  }
};

module.updateCameras();

// defaultPerspectiveCamera and defaultOrthographicCamera and cameraToUseOnPlay are used in App (when !isInjected)
module.currentScene.__inspectorData.currentCamera =
  useAppStore.getState().cameraType === 'perspective' ? defaultPerspectiveCamera : defaultOrthographicCamera;

// update helpers for selected object when it is changed
useAppStore.subscribe(
  (appStore) => appStore.selectedObjectStateFake,
  () => {
    const selectedObject = useAppStore.getState().getSelectedObject();
    selectedObject!.traverse((descendant) => {
      descendant.__inspectorData.dependantObjects!.forEach((dependantObject) => {
        const update =
          dependantObject instanceof RectAreaLightHelper
            ? dependantObject.updateMatrixWorld
            : dependantObject instanceof LightProbeHelper
              ? dependantObject.onBeforeRender
              : 'update' in dependantObject
                ? dependantObject.update
                : () => {}; // updates object.matrixWorld
        // @ts-ignore
        update.call(dependantObject);
      });
    });
  }
);

Object.keys(module).forEach((key) => {
  const typedKey = key as keyof typeof module;
  if (typeof module[typedKey] === 'function') {
    // @ts-ignore
    module[typedKey] = module[typedKey].bind(module);
  }
});

export default module;

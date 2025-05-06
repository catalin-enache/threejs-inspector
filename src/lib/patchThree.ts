import * as THREE from 'three';
import { RefObject } from 'react';
import type { RootState } from '@react-three/fiber';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper';
import { LightProbeHelper } from 'three/examples/jsm/helpers/LightProbeHelper';
import { PositionalAudioHelper } from 'three/examples/jsm/helpers/PositionalAudioHelper';
import { refreshOutliner } from 'lib/third_party/outlinerHelpers';
import { objectHasSkeleton, isAutoInspectableObject } from 'lib/utils/objectUtils';
import { useAppStore } from 'src/store';
import { offlineScene } from 'components/CPanel/offlineScene';
import {
  Follower,
  EmptyFollower,
  CubeCameraHelper,
  CubeCameraPicker,
  SpotLightPicker,
  CameraPicker,
  DirectionalLightPicker,
  RectAreaLightPicker,
  PointLightPicker,
  LightProbePicker
} from 'lib/followers';
import './patchCubeCamera';
import type { __inspectorData } from 'tsExtensions';
import { deepClean } from 'lib/utils/cleanUp';
import { CameraControlsRefType } from 'components/CameraControls';

THREE.EventDispatcher.prototype.clearListeners = (function () {
  return function (type?: string) {
    if (!type) {
      // @ts-ignore
      this._listeners = {};
      return;
    }
    // @ts-ignore
    const listeners = this._listeners[type];
    if (listeners) {
      listeners.length = 0;
    }
  };
})();

if (!Object.getPrototypeOf(THREE.Object3D.prototype).__inspectorData) {
  Object.defineProperty(THREE.Object3D.prototype, '__inspectorData', {
    get: function () {
      if (!this._innerInspectorData) {
        const __inspectorData: Partial<__inspectorData> = {};
        const data: any = {};
        const scope = this;
        Object.defineProperty(__inspectorData, 'isInspectable', {
          get: () => {
            // console.log('isInspectable getter called', scope.name || scope.type || scope.uuid);
            return data._isInspectable;
          },
          set: (value) => {
            data._isInspectable = value;
            scope.children.forEach((child: THREE.Object3D) => {
              if (child instanceof THREE.Bone) return; // no need to set isInspectable on bones
              child.__inspectorData.isInspectable = value;
              // only need hitRedirect on descendants if it's not set, not on root
              if (!child.__inspectorData.hitRedirect) {
                child.__inspectorData.hitRedirect = scope;
              }
            });
          },
          configurable: true
        });
        Object.defineProperty(__inspectorData, 'hitRedirect', {
          get: () => {
            // console.log('hitRedirect getter called', scope.name || scope.type || scope.uuid);
            return data._hitRedirect;
          },
          set: (value) => {
            data._hitRedirect = value;
            scope.children.forEach((child: THREE.Object3D) => {
              child.__inspectorData.hitRedirect = value;
            });
          },
          configurable: true
        });
        Object.defineProperty(__inspectorData, 'dependantObjects', {
          get: () => {
            if (!data._dependantObjects) data._dependantObjects = [];
            return data._dependantObjects;
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

const addOrAttach = (
  scope: THREE.Object3D,
  object: THREE.Object3D,
  original: (typeof THREE.Object3D.prototype)['add'] | (typeof THREE.Object3D.prototype)['attach']
) => {
  object.__inspectorData.isBeingAdded = true;
  // Note:
  //  - the method calls removeFromParent
  original.call(scope, object);
  object.__inspectorData.isBeingAdded = false;

  if (module.isSceneObject(scope)) {
    module.handleObjectAdded(object);
    refreshOutliner({ scene: module.currentScene });
  } else if (module.isMainScene(scope)) {
    module.handleObjectAdded(object);
    refreshOutliner({ scene: module.currentScene });
  }
  // The last branch here would be if we add to a non-scene object.
  // In that case, we don't need to do anything.
  // It will be handled when it gets added to the scene in the second branch.
};

// Be aware: the patch applies to the internal scene of TexturePlugin too.
THREE.Object3D.prototype.add = (function () {
  const original = THREE.Object3D.prototype.add;
  return function (this: THREE.Object3D, ...objects: THREE.Object3D[]) {
    objects.forEach((object) => {
      addOrAttach(this, object, original);
    });

    return this;
  };
})();

THREE.Object3D.prototype.attach = (function () {
  const original = THREE.Object3D.prototype.attach;
  return function (this: THREE.Object3D, ...objects: THREE.Object3D[]) {
    objects.forEach((object) => {
      addOrAttach(this, object, original);
    });

    return this;
  };
})();

THREE.Object3D.prototype.remove = (function () {
  const originalRemove = THREE.Object3D.prototype.remove;
  return function (this: THREE.Object3D, ...objects: THREE.Object3D[]) {
    objects.forEach((object) => {
      if (object.__inspectorData.isBeingAdded) {
        // e.g. transferring helpers to injected scene
        return originalRemove.call(this, object);
      }
      module.cleanupBeforeRemovingObject(object);
      const isSceneObject = module.isSceneObject(object);
      originalRemove.call(this, object);
      isSceneObject && refreshOutliner({ scene: module.currentScene });
      module.cleanupAfterRemovedObject(object);
    });
    return this;
  };
})();

THREE.Object3D.prototype.destroy = (function () {
  return function (this: THREE.Object3D) {
    deepClean(this);
  };
})();

THREE.Object3D.prototype.updateMatrixWorld = (function () {
  const originalUpdateMatrixWorld = THREE.Object3D.prototype.updateMatrixWorld;
  return function (this: THREE.Object3D, force: boolean) {
    originalUpdateMatrixWorld.call(this, force);
    if (this.__inspectorData.updatingMatrixWorld) return;
    this.__inspectorData.updatingMatrixWorld = true;
    module.updateDependants(this);
    delete this.__inspectorData.updatingMatrixWorld;
  };
})();

THREE.Object3D.prototype.updateWorldMatrix = (function () {
  const originalUpdateWorldMatrix = THREE.Object3D.prototype.updateWorldMatrix;
  return function (this: THREE.Object3D, updateParents: boolean, updateChildren: boolean) {
    originalUpdateWorldMatrix.call(this, updateParents, updateChildren);
    if (this.__inspectorData.updatingWorldMatrix) return;
    this.__inspectorData.updatingWorldMatrix = true;
    module.updateDependants(this);
    delete this.__inspectorData.updatingWorldMatrix;
  };
})();

// ==============================================================================

export const defaultScene = new THREE.Scene();
const cameraPosition = new THREE.Vector3(0, 0, 24); // 100, 200, 300
export const defaultPerspectiveCamera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  10000
);
defaultPerspectiveCamera.position.copy(cameraPosition);
defaultPerspectiveCamera.zoom = 1;
defaultPerspectiveCamera.name = 'DefaultPerspectiveCamera';

export const defaultOrthographicCamera = new THREE.OrthographicCamera(-0, 0, 0, -0, 0.1, 10000);
defaultOrthographicCamera.position.copy(cameraPosition);
defaultOrthographicCamera.zoom = 45;
defaultOrthographicCamera.name = 'DefaultOrthographicCamera';

type Module = {
  threeRootState: RootState;
  setThreeRootState: (three: RootState) => void;
  getThreeRootState: () => RootState;
  currentScene: THREE.Scene;
  getCurrentScene: () => THREE.Scene;
  setCurrentScene: (scene: THREE.Scene) => void;
  clearScene: () => void;
  currentCamera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  getCurrentCamera: () => THREE.PerspectiveCamera | THREE.OrthographicCamera;
  setCurrentCamera: (camera: THREE.PerspectiveCamera | THREE.OrthographicCamera) => void;
  transformControls: TransformControls | null | undefined;
  getTransformControls: () => TransformControls | null | undefined;
  createTransformControls: (cameraControlsRef: RefObject<CameraControlsRefType | null>) => void;
  attachTransformControls: (_: {
    selectedObject?: THREE.Object3D | null;
    showHelper?: boolean;
    cameraControlsRef: RefObject<CameraControlsRefType | null>;
  }) => void;
  disposeTransformControls: (_?: { resetSelectedObject?: boolean }) => void;
  showTransformControls: () => void;
  hideTransformControls: () => void;
  render: () => void;
  currentRenderer: THREE.WebGLRenderer | null;
  getCurrentRenderer: () => THREE.WebGLRenderer | null;
  setCurrentRenderer: (renderer: THREE.WebGLRenderer) => void;
  interactableObjects: Record<string, THREE.Object3D>;
  updateCameras: () => void;
  updateCubeCamera: (cubeCamera: THREE.CubeCamera) => void;
  updateCubeCameras: () => void;
  refreshCPanel: () => void;
  defaultPerspectiveCamera: THREE.PerspectiveCamera;
  defaultOrthographicCamera: THREE.OrthographicCamera;
  cameraToUseOnPlay: THREE.PerspectiveCamera | THREE.OrthographicCamera | null;
  getCameraToUseOnPlay: () => THREE.PerspectiveCamera | THREE.OrthographicCamera | null;
  shouldUseCameraControls: (camera: THREE.PerspectiveCamera | THREE.OrthographicCamera) => boolean;
  getIsUseOnPlayCamera: (camera: THREE.PerspectiveCamera | THREE.OrthographicCamera) => boolean;
  isSafeToMakeHelpers: boolean;
  updateHelper: (helper: __inspectorData['helper']) => void;
  updateDependants: (object: THREE.Object3D) => void;
  makeHelpers: (object: THREE.Object3D) => void;
  doesNotNeedHelper: (object: THREE.Object3D) => boolean;
  isSceneObject: (object: THREE.Object3D) => boolean;
  isMainScene: (scene: any) => boolean;
  handleObjectAdded: (object: THREE.Object3D) => void;
  cleanupBeforeRemovingObject: (object: THREE.Object3D) => void;
  cleanupAfterRemovedObject: (object: THREE.Object3D) => void;
  subscriptions: Record<string, (() => void)[]>;
};

const module: Module = {
  threeRootState: {} as RootState,
  setThreeRootState(three: RootState) {
    this.threeRootState = three;
  },
  getThreeRootState() {
    return this.threeRootState;
  },

  currentScene: defaultScene,
  getCurrentScene() {
    return this.currentScene;
  },
  setCurrentScene(scene: THREE.Scene) {
    this.currentScene = scene;
    this.updateCubeCameras();
  },
  clearScene() {
    window.dispatchEvent(new CustomEvent('TIFMK.ClearScene'));
    this.disposeTransformControls({ resetSelectedObject: true });
    deepClean(this.currentScene);
  },

  // defaultPerspectiveCamera and defaultOrthographicCamera and cameraToUseOnPlay are used in App (when !isInjected)
  currentCamera:
    useAppStore.getState().cameraType === 'perspective' ? defaultPerspectiveCamera : defaultOrthographicCamera,
  getCurrentCamera() {
    return this.currentCamera;
  },
  setCurrentCamera(camera: THREE.PerspectiveCamera | THREE.OrthographicCamera) {
    this.currentCamera = camera;
    if (this.transformControls) {
      this.transformControls.camera = camera;
    }
  },

  transformControls: null,
  getTransformControls() {
    return this.transformControls;
  },
  createTransformControls(cameraControlsRef: RefObject<CameraControlsRefType | null>) {
    const transformControls = this.transformControls;
    if (transformControls) {
      return;
    }

    const camera = this.getCurrentCamera();
    const renderer = this.currentRenderer;
    if (!camera || !renderer) {
      return;
    }

    const handleTransformControlsObjectChange = (_event: THREE.Event<'objectChange', TransformControls>) => {
      useAppStore.getState().triggerSelectedObjectChanged();
    };

    // Preventing here for camera controls to interfere with transform controls
    const handleTransformControlsDraggingChanged = (event: any) => {
      useAppStore.getState().setIsDraggingTransformControls(event.value);
      cameraControlsRef.current?.setIsDisabled(event.value);
    };

    this.transformControls = new TransformControls(camera, renderer.domElement);
    this.transformControls.getHelper().name = 'DefaultTransformControls';
    this.transformControls.addEventListener('objectChange', handleTransformControlsObjectChange);
    this.transformControls.addEventListener('dragging-changed', handleTransformControlsDraggingChanged);
  },

  attachTransformControls({
    selectedObject = useAppStore.getState().getSelectedObject(),
    showHelper = useAppStore.getState().showGizmos,
    cameraControlsRef
  }: {
    selectedObject?: THREE.Object3D | null;
    showHelper?: boolean;
    cameraControlsRef: RefObject<CameraControlsRefType | null>;
  }) {
    if (!selectedObject) {
      return;
    }
    if (!this.transformControls) {
      this.createTransformControls(cameraControlsRef);
    }
    const transformControls = this.transformControls!;
    transformControls.attach(selectedObject);
    if (showHelper) {
      this.showTransformControls();
    }
  },

  disposeTransformControls({ resetSelectedObject = false } = {}) {
    const transformControls = this.transformControls;
    if (!transformControls) return;

    if (resetSelectedObject) {
      resetSelectedObject && useAppStore.getState().setSelectedObject(null);
    }

    this.hideTransformControls();
    transformControls.detach();
    transformControls.disconnect();
    transformControls.dispose();
    transformControls.clearListeners();
    this.transformControls = null;
  },

  showTransformControls() {
    if (!this.transformControls) return;
    // it will  not be added multiple times cos when adding something, three first removes it from parent
    this.currentScene.add(this.transformControls.getHelper());
  },

  hideTransformControls() {
    if (!this.transformControls) return;
    this.transformControls.getHelper().removeFromParent();
  },

  render() {
    if (!this.currentRenderer || !this.currentScene || !this.getCurrentCamera()) return;
    this.currentRenderer?.render(this.currentScene, this.getCurrentCamera()!);
  },
  interactableObjects: {},
  subscriptions: {},
  currentRenderer: null,
  getCurrentRenderer() {
    return this.currentRenderer;
  },
  setCurrentRenderer(renderer: THREE.WebGLRenderer) {
    this.currentRenderer = renderer;
    this.updateCubeCameras();
  },
  // ----------------------------------- Cameras >> -----------------------------------

  defaultPerspectiveCamera,
  defaultOrthographicCamera,
  // cameraToUseOnPlay feature is specific to useDefaultSetup
  // using the framework as App - not when injecting Inspector in another App
  cameraToUseOnPlay: null,
  getCameraToUseOnPlay() {
    return this.cameraToUseOnPlay;
  },

  shouldUseCameraControls(camera: THREE.PerspectiveCamera | THREE.OrthographicCamera) {
    const isUseOnPlayCamera = this.getIsUseOnPlayCamera(camera);
    const autoNavControls = useAppStore.getState().autoNavControls;
    const attachDefaultControllersToPlayingCamera = useAppStore.getState().attachDefaultControllersToPlayingCamera;
    return autoNavControls && (!isUseOnPlayCamera || attachDefaultControllersToPlayingCamera);
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

  getIsUseOnPlayCamera(camera: THREE.PerspectiveCamera | THREE.OrthographicCamera): boolean {
    return !!camera.__inspectorData.useOnPlay;
  },

  // ----------------------------------- << Cameras -----------------------------------

  isSafeToMakeHelpers: true,

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

  doesNotNeedHelper(object: THREE.Object3D) {
    // R3F does not add cameras to scene, so this check is not needed, but checking just in case
    return (
      object === defaultPerspectiveCamera ||
      object === defaultOrthographicCamera ||
      object.parent instanceof THREE.CubeCamera
    );
  },

  updateDependants(object: THREE.Object3D) {
    if (object.__inspectorData?.helper && object.__inspectorData?.helper.visible) {
      module.updateHelper(object.__inspectorData.helper);
    }
    if (object.__inspectorData?.picker && object.__inspectorData?.picker.visible) {
      object.__inspectorData.picker.update();
    }
  },

  updateHelper(helper: __inspectorData['helper']) {
    if (helper) {
      const update =
        helper instanceof RectAreaLightHelper
          ? helper.updateMatrixWorld
          : helper instanceof LightProbeHelper
            ? helper.onBeforeRender
            : 'update' in helper
              ? helper.update
              : () => {};
      // @ts-ignore
      update.call(helper);
    }
  },

  makeHelpers(object: THREE.Object3D) {
    // when importing a json scene, some references are not yet set but are pointing to UUIds
    // due to this, for example DirectionalLightHelper does not reference a light.target,
    // and it fails when calling update() in its constructor
    // this would be set to false temporarily when importing a json scene
    if (!this.isSafeToMakeHelpers) return;
    // already having helper/picker
    if (object.__inspectorData.dependantObjects?.length) return;

    if (module.doesNotNeedHelper(object)) return;

    const hasSkeleton = objectHasSkeleton(object);
    // only making helpers/pickers for autoInspectableObjects or helpers for SkinnedMeshes
    if (!isAutoInspectableObject(object) && !hasSkeleton) return;

    // console.log('Making helpers for', object.name || object.type || object.uuid, object);
    if (hasSkeleton) {
      // console.log('has skeleton', object.name || object.type || object.uuid, object);
    }

    // we don't need pickers for SkinnedMeshes, just helpers
    const pickerIsNeeded = !hasSkeleton;

    const helperSize = useAppStore.getState().gizmoSize;
    // TODO: check other included helpers (e.g. OctreeHelper)
    const helper: THREE.Object3D['__inspectorData']['helper'] = hasSkeleton
      ? new THREE.SkeletonHelper(object)
      : object instanceof THREE.PerspectiveCamera || object instanceof THREE.OrthographicCamera
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
                      ? new CubeCameraHelper(object as THREE.CubeCamera, { size: helperSize })
                      : object instanceof THREE.PositionalAudio
                        ? new EmptyFollower(object).add(
                            new PositionalAudioHelper(object as THREE.PositionalAudio, helperSize)
                          )
                        : new Follower(object, { size: helperSize }); // meaningless helper

    helper.name = `helper for ${object.name || object.type || ''} ${object.uuid}`;

    const pickerGeometry = new THREE.BoxGeometry(helperSize, helperSize, helperSize); // generic mesh geometry

    const picker: Follower =
      object instanceof THREE.LightProbe
        ? new LightProbePicker(object, { size: helperSize })
        : object instanceof THREE.PointLight
          ? new PointLightPicker(object, { size: helperSize })
          : object instanceof THREE.RectAreaLight
            ? new RectAreaLightPicker(object)
            : object instanceof THREE.DirectionalLight
              ? new DirectionalLightPicker(object, { size: helperSize })
              : object instanceof THREE.CubeCamera
                ? new CubeCameraPicker(object, { size: helperSize })
                : object instanceof THREE.SpotLight
                  ? new SpotLightPicker(object, { size: helperSize })
                  : object instanceof THREE.PerspectiveCamera || object instanceof THREE.OrthographicCamera
                    ? new CameraPicker(object, { size: helperSize })
                    : new Follower(object, { size: helperSize, geometry: pickerGeometry });

    picker.name = `picker for ${object.name || object.type || ''} ${object.uuid}`;

    const objectInspectorData = object.__inspectorData;
    const pickerInspectorData = picker.__inspectorData;
    const helperInspectorData = helper.__inspectorData;

    if (pickerIsNeeded) {
      objectInspectorData.picker = picker;
      pickerInspectorData.isPicker = true;
      pickerInspectorData.hitRedirect = object;
    }

    objectInspectorData.helper = helper;
    helperInspectorData.isHelper = true;

    pickerIsNeeded ? objectInspectorData.dependantObjects!.push(picker) : picker.dispose();
    objectInspectorData.dependantObjects!.push(helper);

    const showHelpers = useAppStore.getState().showHelpers;
    const showGizmos = useAppStore.getState().showGizmos;
    helper.visible = showGizmos && showHelpers;
    picker.visible = showGizmos;

    this.subscriptions[object.uuid] = this.subscriptions[object.uuid] || [];

    this.subscriptions[object.uuid].push(
      useAppStore.subscribe(
        (appStore) => appStore.showGizmos,
        (showGizmos) => {
          helper.visible = showGizmos;
          picker.visible = showGizmos;
          this.render(); // support 'demand' frameloop
        }
      )
    );

    this.subscriptions[object.uuid].push(
      useAppStore.subscribe(
        (appStore) => appStore.showHelpers && appStore.showGizmos,
        (showHelpers) => {
          helper.visible = showHelpers;
          this.render(); // support 'demand' frameloop
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
              this.currentScene.remove(helper);
              pickerIsNeeded && this.currentScene.remove(picker);
            } else {
              this.currentScene.add(helper);
              pickerIsNeeded && this.currentScene.add(picker);
              // pickerIsNeeded && (this.interactableObjects[picker.uuid] = picker); // not needed, already handled in handleObjectAdded
            }
          }
        }
      )
    );
  },

  updateCubeCamera(cubeCamera: THREE.CubeCamera) {
    if (!this.currentRenderer) {
      return;
    }
    const currentVisible = cubeCamera.visible;
    cubeCamera.visible = false;
    if (cubeCamera.__inspectorData?.helper) {
      ((cubeCamera.__inspectorData.helper as Follower).material as THREE.MeshPhongMaterial).visible = false;
    }
    cubeCamera.update(this.currentRenderer, this.currentScene);
    cubeCamera.visible = currentVisible;
    if (cubeCamera.__inspectorData?.helper) {
      ((cubeCamera.__inspectorData.helper as Follower).material as THREE.MeshPhongMaterial).visible = true;
    }
  },

  updateCubeCameras() {
    this.currentScene.traverse((object) => {
      if (object instanceof THREE.CubeCamera) {
        this.updateCubeCamera(object);
      }
    });
  },

  refreshCPanel() {
    useAppStore.getState().triggerCPanelStateChanged();
  },

  // Note:
  // - called for any object only if already in the scene or just added to scene (not called on detached objects)
  // - is also called for helpers/pickers themselves // from this.currentScene.add(dep);
  handleObjectAdded(object: THREE.Object3D) {
    // console.log('handleObjectAdded', object.name || object.type || object.uuid, object);
    object.traverse((obj) => {
      const __inspectorData = obj.__inspectorData;

      if (__inspectorData.isPicker || __inspectorData.isInspectable) {
        this.interactableObjects[obj.uuid] = obj;
      }

      if (
        (obj instanceof THREE.PerspectiveCamera || obj instanceof THREE.OrthographicCamera) &&
        __inspectorData.useOnPlay
      ) {
        // if multiple cameras are useOnPlay, only the last one will be considered
        this.cameraToUseOnPlay = obj as THREE.PerspectiveCamera | THREE.OrthographicCamera;
        // current camera did not change just yet, only cameraToUseOnPlay is updated
        // current camera is updated in Setup which sets it to cameraToUseOnPlay if it's not null
      }

      this.makeHelpers(obj); // will enrich certain objects with helper and picker

      // patchThree acts early and adds helpers to defaultScene before instantiating the scene to inject the Inspector into,
      // when injected, helpers that were added to defaultScene will be transferred to the new scene
      (__inspectorData.dependantObjects || []).forEach((dep) => {
        this.currentScene.add(dep);
      });

      if (obj instanceof THREE.CubeCamera) {
        this.updateCubeCamera(obj); // assumes CubeCamera helper has been created
      }
    });
  },

  // NOTE:
  // - an object can be removed from its parent as a result of being added to another parent
  // - the object can be a picker/helper
  // - this is also called from offlineScene
  cleanupBeforeRemovingObject(object: THREE.Object3D) {
    // console.log('cleanupBeforeRemovingObject', object.name || object.type || object.uuid, object);
    object.traverse((obj) => {
      while (this.subscriptions[obj.uuid]?.length) {
        this.subscriptions[obj.uuid].pop()!();
      }

      // if (obj === this.transformControls?.object) {}
      if (obj === useAppStore.getState().getSelectedObject()) {
        this.disposeTransformControls({ resetSelectedObject: !obj.__inspectorData.isBeingAdded });
      }

      delete this.interactableObjects[obj.uuid];

      if (this.cameraToUseOnPlay === obj) {
        this.cameraToUseOnPlay = null;
      }
    });
  },

  // NOTE:
  // - an object can be removed from its parent as a result of being added to another parent (isBeingAdded)
  // - the object can be a picker/helper too
  // - this is also called from offlineScene
  cleanupAfterRemovedObject(object: THREE.Object3D) {
    // console.log('cleanupAfterRemovedObject', object.name || object.type || object.uuid, object);
    object.traverse((obj) => {
      while (obj.__inspectorData.dependantObjects!.length) {
        const dependantObject = obj.__inspectorData.dependantObjects!.pop()!;
        const removed = dependantObject.removeFromParent();
        if ((removed as Follower).dispose) {
          (removed as Follower).dispose();
        } else {
          console.warn('dispose not available in a dependent object', removed);
        }
      }
    });
  }
};

module.updateCameras();

Object.keys(module).forEach((key) => {
  const typedKey = key as keyof typeof module;
  if (typeof module[typedKey] === 'function') {
    // @ts-ignore
    module[typedKey] = module[typedKey].bind(module);
  }
});

export default module;

// @ts-ignore
window.patchThree = module;

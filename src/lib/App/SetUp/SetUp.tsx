import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useCallback, useEffect, useRef } from 'react';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib';
import { LightProbeHelper } from 'three/examples/jsm/helpers/LightProbeHelper';
import { PositionalAudioHelper } from 'three/examples/jsm/helpers/PositionalAudioHelper';
import { FlyControls } from 'lib/App/FlyControls';
import { useAppStore } from 'src/store';
import { refreshOutliner } from 'lib/third_party/outlinerHelpers';
import { offlineScene } from 'lib/App/CPanel/offlineScene';
import './patchThree';
// @ts-ignore
import { outliner } from 'lib/third_party/ui.outliner';

RectAreaLightUniformsLib.init(); // required for RectAreaLight

const defaultScene = new THREE.Scene();
let currentScene = defaultScene;
const inspectableObjects: Record<string, THREE.Object3D> = {};

// ----------------------------------- Cameras >> -----------------------------------

const cameraPosition = new THREE.Vector3(0, 0, 12);
const defaultPerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
defaultPerspectiveCamera.position.copy(cameraPosition);
defaultPerspectiveCamera.zoom = 1;
defaultPerspectiveCamera.name = 'DefaultPerspectiveCamera';

const defaultOrthographicCamera = new THREE.OrthographicCamera(-0, 0, 0, -0, 0.1, 10000);
defaultOrthographicCamera.position.copy(cameraPosition);
defaultOrthographicCamera.zoom = 45;
defaultOrthographicCamera.name = 'DefaultOrthographicCamera';

let cameraToUseOnPlay: THREE.PerspectiveCamera | THREE.OrthographicCamera | null = null;

// defaultPerspectiveCamera and defaultOrthographicCamera and cameraToUseOnPlay are used in App (when !isInjected)
currentScene.__inspectorData.currentCamera =
  useAppStore.getState().cameraType === 'perspective' ? defaultPerspectiveCamera : defaultOrthographicCamera;

const updateCameras = () => {
  defaultPerspectiveCamera.aspect = window.innerWidth / window.innerHeight;
  defaultPerspectiveCamera.updateProjectionMatrix();

  defaultOrthographicCamera.left = window.innerWidth / -2;
  defaultOrthographicCamera.right = window.innerWidth / 2;
  defaultOrthographicCamera.top = window.innerHeight / 2;
  defaultOrthographicCamera.bottom = window.innerHeight / -2;
  defaultOrthographicCamera.updateProjectionMatrix();

  // update currentCamera knowledge about window re-size that might happened before play
  if (cameraToUseOnPlay instanceof THREE.PerspectiveCamera) {
    cameraToUseOnPlay.aspect = defaultPerspectiveCamera.aspect;
    cameraToUseOnPlay.updateProjectionMatrix();
  } else if (cameraToUseOnPlay instanceof THREE.OrthographicCamera) {
    cameraToUseOnPlay.left = defaultOrthographicCamera.left;
    cameraToUseOnPlay.right = defaultOrthographicCamera.right;
    cameraToUseOnPlay.top = defaultOrthographicCamera.top;
    cameraToUseOnPlay.bottom = defaultOrthographicCamera.bottom;
    cameraToUseOnPlay.updateProjectionMatrix();
  }
};

updateCameras();

const getIsPlayingCamera = (camera: THREE.Camera) =>
  camera !== defaultPerspectiveCamera && camera !== defaultOrthographicCamera;

// ----------------------------------- << Cameras -----------------------------------

const objectHasSkeleton = (object: THREE.Object3D) => {
  let hasSkeleton = false;
  object.traverse((descendant) => {
    if (descendant instanceof THREE.SkinnedMesh) {
      hasSkeleton = true;
    }
  });
  return hasSkeleton;
};

const shouldContainItsHelper = (object: THREE.Object3D) => {
  return [THREE.PositionalAudio].some((Type) => object instanceof Type);
};

const makeHelpers = (object: THREE.Object3D) => {
  let helper: THREE.Object3D['__inspectorData']['helper'];

  let picker: THREE.Mesh;

  let hasSkeleton = objectHasSkeleton(object);

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
  helper = hasSkeleton
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

  const meshGeometry =
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

  helper.name = `helper for ${object.name || object.type || ''} ${object.uuid}`;
  helper.__inspectorData.isHelper = true;

  picker = new THREE.Mesh(
    meshGeometry,
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

  if (object instanceof THREE.SpotLight) {
    picker.lookAt(object.target.position);
  }
  object.__inspectorData.dependantObjects!.push(helper);

  // helper is added to the scene in handleObjectAdded function except helpers for these object types
  if (shouldContainItsHelper(object)) {
    object.add(helper);
  }

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
  );

  const showHelpers = useAppStore.getState().showHelpers;
  const showGizmos = useAppStore.getState().showGizmos;
  helper.visible = showGizmos && showHelpers;
  picker.visible = showGizmos;

  useAppStore.subscribe(
    (appStore) => appStore.showGizmos,
    (showGizmos) => {
      helper.visible = showGizmos;
      picker.visible = showGizmos;
    }
  );

  useAppStore.subscribe(
    (appStore) => appStore.showHelpers && appStore.showGizmos,
    (showHelpers) => {
      helper.visible = showHelpers;
    }
  );

  useAppStore.subscribe(
    (appStore) => appStore.playingState,
    (playingState) => {
      // we don't need to remove helpers for default cameras since R3F does not add cameras to scene
      if (objectInspectorData.useOnPlay) {
        if (['playing', 'paused'].includes(playingState)) {
          pickerIsNeeded && object.remove(picker);
          // since threeScene is global, we can access its latest value here
          currentScene.remove(helper);
        } else {
          pickerIsNeeded && object.add(picker);
          inspectableObjects[picker.uuid] = picker;
          currentScene.add(helper);
        }
      }
    }
  );
};

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

const destroy = (object: any) => {
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
};

const cleanupAfterRemovedObject = (object: THREE.Object3D) => {
  object.traverse((child) => {
    if (currentScene.__inspectorData.transformControlsRef?.current?.object === child) {
      currentScene.__inspectorData.transformControlsRef.current.detach();
    }

    while (child.__inspectorData.dependantObjects!.length) {
      const dependantObject = child.__inspectorData.dependantObjects!.pop()!;
      dependantObject.removeFromParent();
      destroy(dependantObject);
    }

    // No need to destroy everything, geometries and materials might be reused
    const destroyOnRemove = useAppStore.getState().destroyOnRemove;
    if (
      (destroyOnRemove || child.__inspectorData.isPicker) &&
      child.__inspectorData.hitRedirect !== cameraToUseOnPlay
    ) {
      // helpers and pickers for cameraToUseOnPlay needs to stay around
      // TODO: investigate. Renderer Info reports that geometries and textures are less (cleaned up to some extent)
      // but memory (reported by Stats) is not released.
      destroy(child);
    }

    delete inspectableObjects[child.uuid];

    if (cameraToUseOnPlay === child) {
      cameraToUseOnPlay = null;
    }
  });
};

const isSceneObject = (object: THREE.Object3D) => {
  // traverse up to the scene
  let parent = object.parent;
  while (parent && !(parent instanceof THREE.Scene)) {
    parent = parent.parent;
  }
  // we have another offline scene in TexturePlugin
  return parent !== null && parent !== offlineScene;
};

// called for every child of an object only when added to the scene
const handleObjectAdded = (object: THREE.Object3D) => {
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
      makeHelpers(object); // will enrich certain objects with helper and picker
    }
    if (
      (object instanceof THREE.PerspectiveCamera || object instanceof THREE.OrthographicCamera) &&
      __inspectorData.useOnPlay
    ) {
      // if multiple cameras are useOnPlay, only the last one will be considered
      cameraToUseOnPlay = object as THREE.PerspectiveCamera | THREE.OrthographicCamera;
    }
    // picker appears in __inspectorData after makeHelpers is called
    if (__inspectorData.picker) {
      inspectableObjects[__inspectorData.picker.uuid] = __inspectorData.picker;
    } else {
      inspectableObjects[object.uuid] = object;
    }
    // most helpers are added to the scene but some are added to the object itself (e.g. PositionalAudioHelper)
    if (__inspectorData.helper && !shouldContainItsHelper(object)) {
      currentScene.add(__inspectorData.helper);
    }
  }
};

// Be aware: the patch applies to the internal scene of TexturePlugin too.
THREE.Object3D.prototype.add = (function () {
  const originalAdd = THREE.Object3D.prototype.add;
  return function (this: THREE.Object3D, ...objects: THREE.Object3D[]) {
    originalAdd.call(this, ...objects);
    objects.forEach((object) => {
      if (isSceneObject(this)) {
        // console.log('Is scene object already', this.name || this.type || this.uuid, this);
        object.traverse((descendant) => {
          handleObjectAdded(descendant);
        });
        refreshOutliner({ scene: currentScene });
      } else if (this instanceof THREE.Scene && this !== offlineScene) {
        object.traverse((descendant) => {
          handleObjectAdded(descendant);
        });
        refreshOutliner({ scene: currentScene });
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
    const _isSceneObject = objects.some(isSceneObject);
    // things to skip
    if (this instanceof THREE.CubeCamera) {
      // skip children cameras of a cubeCamera
      return originalRemove.call(this, ...objects);
    }
    objects.forEach((object) => {
      cleanupAfterRemovedObject(object);
      if (object === useAppStore.getState().getSelectedObject()) {
        useAppStore.getState().setSelectedObject(null);
      }
    });
    originalRemove.call(this, ...objects);

    if (_isSceneObject) {
      refreshOutliner({ scene: currentScene });
    }
    return this;
  };
})();

const preventContextMenu = (evt: MouseEvent) => {
  evt.preventDefault();
};

interface SetUpProps {
  orbitControls?: OrbitControls | null;
  autoNavControls: boolean; // considered when orbitControls is falsy
  isInjected?: boolean;
}
const SetUp = (props: SetUpProps) => {
  const { orbitControls = null, autoNavControls = false, isInjected = true } = props;
  const { camera, gl, raycaster, pointer, scene } = useThree();

  const setIsInjected = useAppStore((state) => state.setIsInjected);
  const setAutoNavControls = useAppStore((state) => state.setAutoNavControls);

  const playingState = useAppStore((state) => state.playingState);
  const cameraType = useAppStore((state) => state.cameraType);

  const selectedObjectUUID = useAppStore((state) => state.selectedObjectUUID);
  const setSelectedObject = useAppStore((state) => state.setSelectedObject);
  const triggerSelectedObjectChanged = useAppStore((state) => state.triggerSelectedObjectChanged);

  const showGizmos = useAppStore((state) => state.showGizmos);

  const cameraControl = useAppStore((state) => state.cameraControl);
  const attachDefaultControllersToPlayingCamera = useAppStore((state) => state.attachDefaultControllersToPlayingCamera);

  const transformControlsMode = useAppStore((state) => state.transformControlsMode);
  const transformControlsSpace = useAppStore((state) => state.transformControlsSpace);
  const transformControlsRef = useRef<TransformControls | null>(null);

  const orbitControlsRef = useRef<OrbitControls | null | undefined>(null);
  const hitsRef = useRef<THREE.Intersection<THREE.Object3D>[]>([]);
  const lastHitRef = useRef<THREE.Intersection<THREE.Object3D> | null>(null);
  const targetPositionRef = useRef<THREE.Vector3>(new THREE.Vector3());

  useEffect(() => {
    setIsInjected(isInjected);
    setAutoNavControls(autoNavControls);
  }, [isInjected, setIsInjected, autoNavControls, setAutoNavControls]);

  useEffect(() => {
    gl.domElement.addEventListener('contextmenu', preventContextMenu);
    return () => {
      gl.domElement.removeEventListener('contextmenu', preventContextMenu);
    };
  }, [gl]);

  useEffect(() => {
    scene.__inspectorData.currentCamera = camera; // used in sizeUtils when importing model and in App when !isInjected
    scene.__inspectorData.orbitControlsRef = orbitControlsRef;
    scene.__inspectorData.transformControlsRef = transformControlsRef;
    outliner.scene = scene;
    if (scene === currentScene) {
      // prevent re-adding camera helpers once they were removed when playing
      return;
    }
    // Transferring existing helpers.
    // Helpers were added to the threeScene (due to patching Object3D) before receiving here the replacement scene.
    scene.traverse((child) => {
      if (child.__inspectorData.helper) {
        scene.add(child.__inspectorData.helper);
      }
    });

    currentScene = scene;
  }, [scene, camera]);

  const render = useCallback(() => {
    // The render is not necessarily needed because gl.render is called anyway.
    // However, we want instant re-render so that it feels more responsive (eventually).
    gl.render(scene, camera);
  }, [scene, camera, gl]);

  useEffect(() => {
    if (isInjected) return;
    // The currentCamera that we set here is only used in App.
    // It is ignored when injectInspector is used.
    const sceneInspectorData = scene.__inspectorData;
    if (['playing', 'paused'].includes(playingState)) {
      sceneInspectorData.currentCamera = cameraToUseOnPlay || sceneInspectorData.currentCamera;
    } else {
      sceneInspectorData.currentCamera =
        cameraType === 'perspective' ? defaultPerspectiveCamera : defaultOrthographicCamera;
    }
    // notify main App to re-render and send new camera into canvas
    useAppStore.getState().triggerCurrentCameraChanged();
  }, [playingState, cameraType, scene, isInjected]);

  // Create orbit and transform controls (singletons) and attach transform controls to scene
  useEffect(() => {
    // prettier-ignore
    transformControlsRef.current = new TransformControls(camera, gl.domElement);
    transformControlsRef.current.name = 'TransformControls';
    transformControlsRef.current.addEventListener('objectChange', (_event) => {
      triggerSelectedObjectChanged();
    });
    // Preventing here for orbit controls to interfere with transform controls
    let currentEnabled = false;
    transformControlsRef.current.addEventListener('dragging-changed', function (event: any) {
      if (!orbitControlsRef.current) return;
      useAppStore.getState().setIsDraggingTransformControls(event.value);
      if (event.value) {
        currentEnabled = !!orbitControlsRef.current?.enabled;
        orbitControlsRef.current && (orbitControlsRef.current.enabled = false);
      } else {
        orbitControlsRef.current && (orbitControlsRef.current.enabled = currentEnabled);
      }
    });
    scene.add(transformControlsRef.current);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!orbitControlsRef.current) return () => {};
    orbitControlsRef.current?.addEventListener('change', render);
    return () => orbitControlsRef.current?.removeEventListener('change', render);
  }, [render]);

  // Update transform controls behavior
  useEffect(() => {
    if (!transformControlsRef.current) return;
    const transformControls = transformControlsRef.current;
    if (selectedObjectUUID && showGizmos) {
      const selectedObject = useAppStore.getState().getSelectedObject()!;
      transformControls.attach(selectedObject);
      transformControls.setMode(transformControlsMode); // translate | rotate | scale
      transformControls.setSpace(transformControlsSpace); // local | world
    } else {
      transformControls.detach();
    }
  }, [selectedObjectUUID, showGizmos, transformControlsMode, transformControlsSpace]);

  // Update ObitControls (target, camera, enabled) and TransformControls camera
  useEffect(() => {
    updateCameras();
    if (transformControlsRef.current) transformControlsRef.current['camera'] = camera;
    if (!orbitControlsRef.current) return;

    // We react to cameraControl too so that we can preserve the camera position
    // when switching from fly to orbit controls on the same camera

    // distance affects zoom behaviour, OrbitControls assume camera is rotating around 0,0,0
    // the closer to 0,0,0 the less zoom is done
    // Even if camera is looking elsewhere we take 0,0,0 as an arbitrary reference
    const distance = camera.position.length();
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.multiplyScalar(distance);
    targetPositionRef.current = camera.position.clone().add(cameraDirection);

    // Here's an experiment for understanding why camera rotation is changed for the first time it gets controlled by OrbitControls.
    // Explanation is that initial camera rotation is most likely NOT aligned with the world up vector.
    // Inside OrbitControls.update when lookAt is called, the lookAt function, by design,
    // is aligning camera up vector with the world up vector.
    // This experiment adjusts the uo vector based on camera rotation which results in no shifting when camera is attached to OrbitControls.
    // However, the navigation will be more or less chaotic depending on how much the camera up vector is not aligned with world up vector.
    // const localUp = new THREE.Vector3(0, 1, 0); // Local up vector
    // const rotatedUp = localUp.applyQuaternion(camera.quaternion);
    // camera.up.copy(rotatedUp);
    // camera.lookAt(targetPositionRef.current);

    orbitControlsRef.current.object = camera;
    orbitControlsRef.current.target.copy(targetPositionRef.current);
    orbitControlsRef.current.update();
  }, [camera]);

  // On scene double click, set select object
  const onSceneDblClick = useCallback(
    (event: globalThis.MouseEvent) => {
      const shouldSelectInside = event.shiftKey;
      scene.traverse((child) => {
        if (child instanceof THREE.SkinnedMesh) {
          // allow skinned mesh modified by animation to be selectable based on their current shape
          child.computeBoundingBox();
          child.computeBoundingSphere();
        }
      });

      const hits = hitsRef.current;
      hits.length = 0;

      raycaster.setFromCamera(pointer, camera);
      raycaster.intersectObjects(Object.values(inspectableObjects), false, hits);

      lastHitRef.current = hits[0] || null;
      const __inspectorData = lastHitRef.current?.object?.__inspectorData;
      // if we hit a picker or an inner mesh proxy, select the object it represents (hitRedirect)
      // else select the object itself (or inside it if shouldSelectInside)
      const selectedObject =
        shouldSelectInside && !lastHitRef.current?.object.__inspectorData.isPicker
          ? lastHitRef.current?.object
          : __inspectorData?.hitRedirect || lastHitRef.current?.object || null;

      setSelectedObject(selectedObject);
    },
    [raycaster, pointer, camera, setSelectedObject, scene]
  );

  useEffect(() => {
    gl.domElement.addEventListener('dblclick', onSceneDblClick);
    return () => {
      gl.domElement.removeEventListener('dblclick', onSceneDblClick);
    };
  }, [gl, onSceneDblClick]);

  useEffect(() => {
    // Enable/Disable orbit controls
    // The playing camera is set by the App in the scene and received here after that

    if (orbitControlsRef.current) {
      // prevent having more orbit controls active at the same time
      // for the case where orbit controls are injected, and we don't need our default orbit controls active
      orbitControlsRef.current.enabled = false;
    }

    orbitControlsRef.current = orbitControls || (autoNavControls ? new OrbitControls(camera, gl.domElement) : null);

    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled =
        cameraControl === 'orbit' && (!getIsPlayingCamera(camera) || attachDefaultControllersToPlayingCamera);
      // orbitControlsRef.current.enableDamping = true;
      // orbitControlsRef.current.dampingFactor = 0.3;
      // orbitControlsRef.current.autoRotate = true;
    }
  }, [orbitControls, cameraControl, autoNavControls, camera, gl, attachDefaultControllersToPlayingCamera]);

  const isPlayingCamera = getIsPlayingCamera(camera);
  const shouldUseFlyControls =
    autoNavControls &&
    ((isPlayingCamera && attachDefaultControllersToPlayingCamera && cameraControl === 'fly') ||
      (!isPlayingCamera && cameraControl === 'fly'));

  return <>{shouldUseFlyControls && <FlyControls />}</>;
};

// eslint-disable-next-line
export { SetUp, currentScene };

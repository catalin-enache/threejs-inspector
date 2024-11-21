import * as THREE from 'three';
import { RootState, useThree, useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useRef } from 'react';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OrbitControls } from 'lib/third_party/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib';
import { FlyControls } from 'lib/App/FlyControls';
import { useAppStore } from 'src/store';
import patchThree from 'lib/App/SetUp/patchThree';

// @ts-ignore
import { outliner } from 'lib/third_party/ui.outliner';

const {
  getCurrentScene,
  setCurrentScene,
  getIsPlayingCamera,
  getCameraToUseOnPlay,
  shouldContainItsHelper,
  updateCameras,
  shouldUseFlyControls,
  interactableObjects,
  defaultPerspectiveCamera,
  defaultOrthographicCamera
} = patchThree;

RectAreaLightUniformsLib.init(); // required for RectAreaLight

const preventContextMenu = (evt: MouseEvent) => {
  evt.preventDefault();
};

export enum SETUP_EFFECT {
  ORBIT_CONTROLS = 'OrbitControlsEffect'
}

const threeFields = ['camera', 'gl', 'raycaster', 'pointer', 'scene'] as (keyof RootState)[];

export interface SetUpProps {
  orbitControls?: OrbitControls | null;
  autoNavControls: boolean; // considered when orbitControls is falsy
  isInjected?: boolean;
  // for tests
  onThreeChange?: (changed: any, three: RootState) => void;
  onSetupEffect?: (effect: SETUP_EFFECT, data: Record<string, any>) => void;
}

const SetUp = (props: SetUpProps) => {
  const { orbitControls = null, autoNavControls = false, isInjected = true, onSetupEffect, onThreeChange } = props;
  const three = useThree();
  const { camera, gl, raycaster, pointer, scene } = three;

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

  const cacheRef = useRef<any>({});

  useFrame(() => {
    if (orbitControlsRef.current?.enabled && orbitControlsRef.current?.enableDamping) {
      orbitControlsRef.current?.update();
    }
  });

  useEffect(() => {
    (threeFields as (keyof RootState)[]).forEach((key) => {
      if (three[key] !== cacheRef.current[key]) {
        const val = three[key];
        onThreeChange?.(key, three);
        if (cacheRef.current) {
          cacheRef.current[key] = val;
        }
      }
    });
  }, [threeFields.map((f) => three[f]), onThreeChange]);

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

  // Transferring certain objects from the defaultScene to the scene when scene is changed
  // defaultScene will be replaced by new scene when injected, and it will happen only once.
  // R3F does not support changing the scene after the initial configuration.
  useEffect(() => {
    scene.__inspectorData.currentCamera = camera; // used in App when !isInjected
    scene.__inspectorData.orbitControlsRef = orbitControlsRef;
    scene.__inspectorData.transformControlsRef = transformControlsRef;
    outliner.scene = scene;

    if (scene === getCurrentScene()) {
      // prevent re-adding camera helpers once they were removed when playing
      return;
    }

    // Transferring existing helpers.
    // Helpers for objects in the scene were added to the threeScene (defaultScene)
    // - due to patching Object3D - before receiving here the actual scene used by the app
    // into which the Inspector was injected.
    scene.traverse((child) => {
      if (child.__inspectorData.helper && !shouldContainItsHelper(child)) {
        scene.add(child.__inspectorData.helper);
      }
    });
    setCurrentScene(scene);
    // For now no one is interested in this event.
    useAppStore.getState().triggerCurrentSceneChanged();
  }, [scene, camera]);

  const render = useCallback(() => {
    // The render is not necessarily needed because gl.render is called anyway.
    // However, we want instant re-render so that it feels more responsive (eventually).
    gl.render(scene, camera);
  }, [scene, camera, gl]);

  useEffect(() => {
    if (isInjected) return;
    // The currentCamera that we set here is only used in App.
    // It is passed to R3F when useDefaultSetup notifies camera changed.
    // It is ignored when injectInspector is used.
    if (['playing', 'paused'].includes(playingState)) {
      scene.__inspectorData.currentCamera = getCameraToUseOnPlay() || scene.__inspectorData.currentCamera;
    } else {
      // Note: when using useDefaultSetup hook, the App !MUST! use the scene and camera from the hook.
      // If that's not desired do not use useDefaultSetup hook but inject the <Inspector /> component instead.
      scene.__inspectorData.currentCamera =
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
      raycaster.intersectObjects(Object.values(interactableObjects), false, hits);

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
    return () => {
      gl.dispose();
    };
  }, [gl]);

  useEffect(() => {
    return () => {
      orbitControlsRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    // Enable/Disable orbit controls
    // The playing camera is set by the App in the scene and received here after that

    if (orbitControlsRef.current) {
      // prevent having more orbit controls active at the same time
      // for the case where orbit controls are injected, and we don't need our default orbit controls active
      orbitControlsRef.current.enabled = false;
    }
    const oldOrbitControls = orbitControlsRef.current;

    orbitControlsRef.current =
      orbitControls ||
      (autoNavControls && !orbitControlsRef.current
        ? new OrbitControls(camera, gl.domElement)
        : orbitControlsRef.current);

    if (oldOrbitControls && oldOrbitControls !== orbitControlsRef.current) {
      // @ts-ignore
      oldOrbitControls.disconnect?.();
      oldOrbitControls.dispose();
    }

    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled =
        cameraControl === 'orbit' && (!getIsPlayingCamera(camera) || attachDefaultControllersToPlayingCamera);
      orbitControlsRef.current.enableDamping =
        orbitControlsRef.current === orbitControls ? orbitControls.enableDamping : true;
      orbitControlsRef.current.dampingFactor =
        orbitControlsRef.current === orbitControls ? orbitControls.dampingFactor : 0.2;
      // orbitControlsRef.current.autoRotate = true;
    }

    onSetupEffect?.(SETUP_EFFECT.ORBIT_CONTROLS, {
      orbitControlsInUse: orbitControlsRef.current,
      orbitControlsReceived: orbitControls
    });
  }, [
    orbitControls,
    cameraControl,
    autoNavControls,
    camera,
    gl,
    attachDefaultControllersToPlayingCamera,
    onSetupEffect
  ]);

  return <>{shouldUseFlyControls(camera) && <FlyControls />}</>;
};

// eslint-disable-next-line
export { SetUp, getCurrentScene };

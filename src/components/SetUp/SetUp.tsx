import * as THREE from 'three';
import { RootState, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useRef } from 'react';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib';
import { FlyControls, FlyControlsRefType } from 'components/FlyControls';
import { useAppStore } from 'src/store';
import patchThree from 'lib/patchThree';
// @ts-ignore
import { outliner } from 'lib/third_party/ui.outliner';

const {
  getCurrentScene,
  setCurrentScene,
  setCurrentRenderer,
  getCameraToUseOnPlay,
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
  TRANSFORM_CONTROLS = 'TransformControlsEffect',
  VERSION_CHANGED = 'VersionChangedEffect' // triggered by Inspector
}

const threeFields = ['camera', 'gl', 'raycaster', 'pointer', 'scene'] as (keyof RootState)[];

export interface SetUpProps {
  autoNavControls: boolean; // considered when orbitControls is falsy
  isInjected?: boolean;
  // for tests
  onThreeChange?: (changed: any, three: RootState) => void;
  onSetupEffect?: (effect: SETUP_EFFECT, data: Record<string, any>) => void;
}

const SetUp = (props: SetUpProps) => {
  const {
    // if using drei camera controls (especially with makeDefault false),
    // set autoNavControls to false, else will conflict
    autoNavControls = false,
    isInjected = true,
    // onSetupEffect,
    onThreeChange
  } = props;
  const three = useThree();
  // The scene received here is settled and will not change. It is either the defaultScene or the scene from the App where Inspector is injected
  const { camera, gl, raycaster, pointer, scene, frameloop, controls } = three;

  patchThree.setThreeRootState(three);

  const setIsInjected = useAppStore((state) => state.setIsInjected);
  const setAutoNavControls = useAppStore((state) => state.setAutoNavControls);

  const playingState = useAppStore((state) => state.playingState);
  const cameraType = useAppStore((state) => state.cameraType);

  const selectedObjectUUID = useAppStore((state) => state.selectedObjectUUID);
  const setSelectedObject = useAppStore((state) => state.setSelectedObject);

  const showGizmos = useAppStore((state) => state.showGizmos);

  const transformControlsMode = useAppStore((state) => state.transformControlsMode);
  const transformControlsSpace = useAppStore((state) => state.transformControlsSpace);

  const hitsRef = useRef<THREE.Intersection<THREE.Object3D>[]>([]);
  const lastHitRef = useRef<THREE.Intersection<THREE.Object3D> | null>(null);

  const flyControlsRef = useRef<FlyControlsRefType>(null);

  const cacheRef = useRef<any>({});

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
    // if controls is not null, it means that the App is using external controls and autoNavControls is not needed
    setAutoNavControls(autoNavControls && !controls);
  }, [isInjected, setIsInjected, autoNavControls, setAutoNavControls, controls]);

  useEffect(() => {
    setCurrentRenderer(gl);
    gl.domElement.addEventListener('contextmenu', preventContextMenu);
    return () => {
      gl.domElement.removeEventListener('contextmenu', preventContextMenu);
    };
  }, [gl]);

  // Transferring certain objects from the defaultScene to the scene when scene is changed
  // defaultScene will be replaced by new scene when injected, and it will happen only once.
  // R3F does not support changing the scene after the initial configuration.
  useEffect(() => {
    outliner.scene = scene;
    const oldScene = getCurrentScene();
    if (scene === oldScene) {
      return;
    }

    // Transferring existing pickers/helpers (dependantObjects).
    // Pickers/Helpers for objects in the scene were added to the threeScene (defaultScene)
    // - due to patching Object3D - before receiving here the actual scene used by the app
    // into which the Inspector was injected.
    scene.traverse((child) => {
      child.__inspectorData.dependantObjects!.forEach((dep) => {
        scene.add(dep);
      });
    });
    setCurrentScene(scene);
    if (oldScene.children.length) {
      console.warn('oldScene still has children', oldScene.children);
    }
    // For now no one is interested in this event.
    useAppStore.getState().triggerCurrentSceneChanged();
  }, [scene, camera]);

  const render = useCallback(() => {
    gl.render(scene, camera);
  }, [scene, camera, gl]);

  useEffect(() => {
    if (isInjected) return;
    // The currentCamera that we set here is only used in App.
    // It is passed to R3F when useDefaultSetup notifies camera changed.
    // It is ignored when injectInspector is used.
    if (['playing', 'paused'].includes(playingState)) {
      patchThree.setCurrentCamera(getCameraToUseOnPlay() || patchThree.getCurrentCamera());
    } else {
      // Note: when using useDefaultSetup hook, the App !MUST! use the scene and camera from the hook.
      // If that's not desired do not use useDefaultSetup hook but inject the <Inspector /> component instead.
      patchThree.setCurrentCamera(cameraType === 'perspective' ? defaultPerspectiveCamera : defaultOrthographicCamera);
    }
    // notify main App to re-render and send new camera into canvas
    useAppStore.getState().triggerCurrentCameraChanged();
  }, [playingState, cameraType, isInjected]);

  // Update transform controls behavior
  useEffect(() => {
    if (selectedObjectUUID && showGizmos) {
      patchThree.attachTransformControls({ showHelper: showGizmos, flyControlsRef });
      const transformControls = patchThree.getTransformControls()!;
      transformControls.setMode(transformControlsMode); // translate | rotate | scale
      transformControls.setSpace(transformControlsSpace); // local | world
    } else {
      patchThree.disposeTransformControls({ resetSelectedObject: !selectedObjectUUID });
    }
  }, [selectedObjectUUID, showGizmos, transformControlsMode, transformControlsSpace]);

  useEffect(() => {
    patchThree.setCurrentCamera(camera); // used in App when !isInjected
    updateCameras();
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
      patchThree.disposeTransformControls({ resetSelectedObject: true });
    };
  }, []);

  useEffect(() => {
    render();
  }, [render, frameloop]);

  return <>{shouldUseFlyControls(camera) && <FlyControls ref={flyControlsRef} />}</>;
};

// eslint-disable-next-line
export { SetUp, getCurrentScene };

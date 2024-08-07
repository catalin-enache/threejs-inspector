import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useCallback, useEffect, useRef } from 'react';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib';
import { FlyControls } from 'lib/App/FlyControls';
import { useAppStore } from 'src/store';
import patchThree from 'lib/App/SetUp/patchThree';

// @ts-ignore
import { outliner } from 'lib/third_party/ui.outliner';

const {
  currentScene,
  setCurrentScene,
  inspectableObjects,
  getIsPlayingCamera,
  cameraToUseOnPlay,
  updateCameras,
  defaultPerspectiveCamera,
  defaultOrthographicCamera
} = patchThree;

RectAreaLightUniformsLib.init(); // required for RectAreaLight

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
    setCurrentScene(scene);
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

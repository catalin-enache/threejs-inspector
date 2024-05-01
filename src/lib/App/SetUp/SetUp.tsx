import * as THREE from 'three';
// @ts-ignore
import { useThree } from '@react-three/fiber';

import { useCallback, useEffect, useRef } from 'react';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib';
import { LightProbeHelper } from 'three/examples/jsm/helpers/LightProbeHelper';

import { FlyControls } from 'lib/App/FlyControls';
import { useAppStore } from 'src/store';
import { focusCamera } from 'lib/utils';
import { userData } from 'src/types';

RectAreaLightUniformsLib.init(); // required for RectAreaLight

const threeScene = new THREE.Scene();
const inspectableObjects: Record<string, THREE.Object3D> = {};
const dependantObjects: Record<string, THREE.Object3D[]> = {};
threeScene.userData.inspectableObjects = inspectableObjects;
threeScene.userData.dependantObjects = dependantObjects;

const makeHelpers = (object: THREE.Object3D) => {
  let helper: userData['helper'];

  let picker: THREE.Mesh;

  // TODO: return early here (in a separate commit)
  if (object instanceof THREE.Light || object instanceof THREE.Camera || object instanceof THREE.CubeCamera) {
    const helperSize = 0.25;
    // TODO: check other included helpers (e.g. LightProbeHelper)
    helper =
      object instanceof THREE.Camera
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

    helper.name = 'helper';

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
    const objectUserData = object.userData as userData;
    const pickerUserData = picker.userData as userData;
    objectUserData.picker = picker;
    objectUserData.helper = helper;
    pickerUserData.object = object;

    object.add(picker);
    if (object instanceof THREE.SpotLight) {
      picker.lookAt(object.target.position);
    }

    dependantObjects[object.uuid] = [helper];
    threeScene.add(helper);

    useAppStore.subscribe(
      (appStore) => appStore.selectedObjectStateFake,
      () => {
        const update =
          helper instanceof RectAreaLightHelper
            ? helper.updateMatrixWorld
            : helper instanceof LightProbeHelper
              ? helper.onBeforeRender
              : 'update' in helper
                ? helper.update
                : () => {}; // updates object.matrixWorld

        // @ts-ignore
        update.call(helper);
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
      (appStore) => appStore.isPlaying,
      (isPlaying) => {
        // we don't need to remove helpers for default cameras since R3F does not add them to scene
        if (objectUserData.useOnPlay) {
          if (isPlaying) {
            object.remove(picker);
            threeScene.remove(helper);
          } else {
            object.add(picker);
            threeScene.add(helper);
          }
        }
      }
    );
  }
};

const removeHelpers = (object: THREE.Object3D) => {
  delete inspectableObjects[object.uuid];
  (dependantObjects[object.uuid] || []).forEach((dependantObject) => {
    dependantObject.parent?.remove(dependantObject);
    (dependantObject as any).dispose?.();
  });
  delete dependantObjects[object.uuid];
};

THREE.Object3D.prototype.add = (function () {
  const originalAdd = THREE.Object3D.prototype.add;
  return function (this: THREE.Object3D, ...objects: THREE.Object3D[]) {
    // things to skip
    if (this instanceof THREE.CubeCamera) {
      // skip children cameras of a cubeCamera
      return originalAdd.call(this, ...objects);
    }
    objects.forEach((object) => {
      const userData = object.userData as userData;
      if (
        userData.isInspectable ||
        (object as THREE.Light).isLight ||
        (object as THREE.Camera).isCamera ||
        object instanceof THREE.CubeCamera
      ) {
        // R3F does not add cameras to scene, so this check is not needed, but checking just in case
        if (object !== perspectiveCamera && object !== orthographicCamera) {
          makeHelpers(object); // will enrich object with helper and picker
        }
        // picker appears in userData after makeHelpers
        if (userData.picker) {
          inspectableObjects[userData.picker.uuid] = userData.picker;
        } else {
          inspectableObjects[object.uuid] = object;
        }
      }

      // if multiple cameras are useOnPlay, only the last one will be considered
      if (
        (object instanceof THREE.PerspectiveCamera || object instanceof THREE.OrthographicCamera) &&
        userData.useOnPlay
      ) {
        cameraToUseOnPlay = object as THREE.PerspectiveCamera | THREE.OrthographicCamera;
      }

      originalAdd.call(this, object);
    });
    return this;
  };
})();

THREE.Object3D.prototype.remove = (function () {
  const originalRemove = THREE.Object3D.prototype.remove;
  return function (this: THREE.Object3D, ...objects: THREE.Object3D[]) {
    // things to skip
    if (this instanceof THREE.CubeCamera) {
      // skip children cameras of a cubeCamera
      return originalRemove.call(this, ...objects);
    }
    objects.forEach((object) => {
      removeHelpers(object);
      if (object === useAppStore.getState().getSelectedObject()) {
        useAppStore.getState().setSelectedObject(null);
      }
    });
    originalRemove.call(this, ...objects);
    return this;
  };
})();

// ----------------------------------- Cameras >> -----------------------------------

// TODO: when using different camera on play we might/will need different controller
export let cameraToUseOnPlay: THREE.PerspectiveCamera | THREE.OrthographicCamera | null = null;

const cameraPosition = new THREE.Vector3(0, 0, 12);
const perspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
perspectiveCamera.position.copy(cameraPosition);
perspectiveCamera.zoom = 1;
perspectiveCamera.name = 'DefaultPerspectiveCamera';

const orthographicCamera = new THREE.OrthographicCamera(-0, 0, 0, -0, 0.1, 100);
orthographicCamera.position.copy(cameraPosition);
orthographicCamera.zoom = 45;
orthographicCamera.name = 'DefaultOrthographicCamera';

const updateCameras = () => {
  perspectiveCamera.aspect = window.innerWidth / window.innerHeight;
  perspectiveCamera.updateProjectionMatrix();

  orthographicCamera.left = window.innerWidth / -2;
  orthographicCamera.right = window.innerWidth / 2;
  orthographicCamera.top = window.innerHeight / 2;
  orthographicCamera.bottom = window.innerHeight / -2;
  orthographicCamera.updateProjectionMatrix();

  if (cameraToUseOnPlay instanceof THREE.PerspectiveCamera) {
    cameraToUseOnPlay.aspect = perspectiveCamera.aspect;
    cameraToUseOnPlay.updateProjectionMatrix();
  } else if (cameraToUseOnPlay instanceof THREE.OrthographicCamera) {
    cameraToUseOnPlay.left = orthographicCamera.left;
    cameraToUseOnPlay.right = orthographicCamera.right;
    cameraToUseOnPlay.top = orthographicCamera.top;
    cameraToUseOnPlay.bottom = orthographicCamera.bottom;
    cameraToUseOnPlay.updateProjectionMatrix();
  }
};

updateCameras();

const getIsPlayingCamera = (camera: THREE.Camera) => camera !== perspectiveCamera && camera !== orthographicCamera;

// ----------------------------------- << Cameras -----------------------------------

const SetUp = () => {
  const { camera, gl, raycaster, pointer, scene } = useThree();

  const isEditorMode = useAppStore((state) => state.showGizmos || state.cPanelVisible);

  const selectedObjectUUID = useAppStore((state) => state.selectedObjectUUID);
  const setSelectedObject = useAppStore((state) => state.setSelectedObject);
  const triggerSelectedObjectChanged = useAppStore((state) => state.triggerSelectedObjectChanged);

  const showGizmos = useAppStore((state) => state.showGizmos);

  const cameraControl = useAppStore((state) => state.cameraControl);
  const attachDefaultControllersToPlayingCamera = useAppStore((state) => state.attachDefaultControllersToPlayingCamera);

  const transformControlsMode = useAppStore((state) => state.transformControlsMode);
  const transformControlsSpace = useAppStore((state) => state.transformControlsSpace);
  const transformControlsRef = useRef<TransformControls | null>(null);

  const orbitControlsRef = useRef<OrbitControls | null>(null);
  const hitsRef = useRef<THREE.Intersection<THREE.Object3D>[]>([]);
  const lastHitRef = useRef<THREE.Intersection<THREE.Object3D> | null>(null);
  const targetPositionRef = useRef<THREE.Vector3>(new THREE.Vector3());

  useEffect(() => {
    // @ts-ignore - just attach them for referencing elsewhere
    scene.orbitControlsRef = orbitControlsRef;
    // @ts-ignore
    scene.transformControlsRef = transformControlsRef;
  }, [scene]);

  // useFrame(() => {
  // updating orbitControls seems to lock scene rotation when changing in cPanel
  // orbitControlsRef.current?.enabled && orbitControlsRef.current?.update();
  // });

  const render = useCallback(() => {
    // The render is not necessarily needed because gl.render is called anyway.
    // However, we want instant re-render so that it feels more responsive (eventually).
    gl.render(scene, camera);
  }, [scene, camera, gl]);

  // Create orbit and transform controls (singletons) and attach transform controls to scene
  useEffect(() => {
    orbitControlsRef.current = new OrbitControls(camera, gl.domElement);
    // orbitControlsRef.current.enableDamping = true;
    // orbitControlsRef.current.dampingFactor = 0.3;
    // orbitControlsRef.current.autoRotate = true;

    // prettier-ignore
    transformControlsRef.current = new TransformControls(camera, gl.domElement);
    transformControlsRef.current.addEventListener('objectChange', (_event) => {
      triggerSelectedObjectChanged();
    });
    // Preventing here for orbit controls to interfere with transform controls
    let currentEnabled = false;
    transformControlsRef.current.addEventListener('dragging-changed', function (event: any) {
      useAppStore.getState().setIsDraggingTransformControls(event.value);
      if (event.value) {
        currentEnabled = !!orbitControlsRef.current?.enabled;
        orbitControlsRef.current && (orbitControlsRef.current.enabled = false);
      } else {
        orbitControlsRef.current && (orbitControlsRef.current.enabled = currentEnabled);
      }
    });
    threeScene.add(transformControlsRef.current);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
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

    // Enable/Disable orbit controls
    // The playing camera is set by the App in the scene and received here after that
    const isPlayingCamera = getIsPlayingCamera(camera);
    if (isPlayingCamera) {
      orbitControlsRef.current.enabled = attachDefaultControllersToPlayingCamera && cameraControl === 'orbit';
    } else {
      orbitControlsRef.current.enabled = cameraControl === 'orbit';
    }
  }, [camera, cameraControl, attachDefaultControllersToPlayingCamera]);

  // Focus camera on 'F' key press
  useEffect(() => {
    const doFocusCamera = (evt: KeyboardEvent) => {
      if (!isEditorMode) return;
      if (evt.code === 'KeyF') {
        focusCamera({
          transformControls: transformControlsRef.current,
          orbitControls: orbitControlsRef.current,
          camera
        });
      }
    };
    document.addEventListener('keydown', doFocusCamera);
    return () => {
      document.removeEventListener('keydown', doFocusCamera);
    };
  }, [camera, isEditorMode]);

  // On scene double click, set select object
  const onSceneDblClick = useCallback(
    (_event: globalThis.MouseEvent) => {
      const hits = hitsRef.current;
      hits.length = 0;

      raycaster.setFromCamera(pointer, camera);
      raycaster.intersectObjects(Object.values(inspectableObjects), false, hits);

      lastHitRef.current = hits[0] || null;
      const userData = lastHitRef.current?.object?.userData as userData;
      // if we hit a picker, select the object it represents else select the object itself
      setSelectedObject(userData?.object || lastHitRef.current?.object || null);
    },
    [raycaster, pointer, camera, setSelectedObject]
  );

  useEffect(() => {
    gl.domElement.addEventListener('dblclick', onSceneDblClick);
    return () => {
      gl.domElement.removeEventListener('dblclick', onSceneDblClick);
    };
  }, [gl, onSceneDblClick]);

  const isPlayingCamera = getIsPlayingCamera(camera);
  const shouldUseFlyControls =
    (isPlayingCamera && attachDefaultControllersToPlayingCamera && cameraControl === 'fly') ||
    (!isPlayingCamera && cameraControl === 'fly');

  return <>{shouldUseFlyControls && <FlyControls />}</>;
};

// eslint-disable-next-line
export { SetUp, threeScene, perspectiveCamera, orthographicCamera };

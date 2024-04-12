import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { FolderApi, Pane, TabApi } from 'tweakpane';
import { useAppStore } from 'src/store';
import { makeContinuousUpdate } from './continuousUpdate';
import { KVEBundle } from './Plugins/KVEBundle/KVEBundle';
import './manipulateMouseSpeed';
import { radToDegFormatter } from 'lib/utils';
import { useThree } from '@react-three/fiber';
import {
  getObject3DBindings,
  getRendererBindings,
  getPaneBindings,
  getCameraStoreBindings,
  getObjectsStoreBindings,
  getSceneButtons,
  getRaycasterParamsBindings,
  buildBindings,
  makeRotationBinding,
  tweakBindingView,
  buildButtons,
  cleanupContainer
} from './bindings';

// ----------------------- >> Remember last scroll position >> --------------------------------

let timeoutId: NodeJS.Timeout | null = null;
let cPanelScrollTop = 0;
export const panelContainer = document.querySelector(
  '#controlPanelContent'
) as HTMLElement;
function onScroll(evt: Event) {
  // @ts-ignore
  cPanelScrollTop = Math.ceil(evt.target.scrollTop);
}
// remember scroll position only when user interacting with the panel (not when automatically scrolled)
panelContainer.addEventListener('wheel', () => {
  panelContainer.addEventListener('scroll', onScroll);
  timeoutId && clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    panelContainer.removeEventListener('scroll', onScroll);
  }, 200);
});

// ----------------------- << Remember last scroll position << --------------------------------

export const CPanel = () => {
  const { camera, scene, gl, raycaster } = useThree();
  const isPlaying = useAppStore((state) => state.isPlaying);
  const paneRef = useRef<Pane | null>(null);
  const cameraControl = useAppStore((state) => state.cameraControl);
  const attachDefaultControllersToPlayingCamera = useAppStore(
    (state) => state.attachDefaultControllersToPlayingCamera
  );
  const cameraType = useAppStore((state) => state.cameraType);
  const transformControlsMode = useAppStore(
    (state) => state.transformControlsMode
  );
  const transformControlsSpace = useAppStore(
    (state) => state.transformControlsSpace
  );
  const cPanelContinuousUpdate = useAppStore(
    (state) => state.cPanelContinuousUpdate
  );
  const angleFormat = useAppStore((state) => state.angleFormat);

  const cPanelVisible = useAppStore((state) => state.cPanelVisible);
  const cPanelCustomParams = useAppStore((state) => state.cPanelCustomParams);
  const triggerCPanelCustomParamsChanged = useAppStore(
    (state) => state.triggerCPanelCustomParamsChanged
  );
  const cPanelCustomControls = useAppStore(
    (state) => state.cPanelCustomControls
  );
  const selectedObject = useAppStore((state) => state.selectedObject);
  const selectedObjectRef = useRef<THREE.Object3D | null>(null);
  const triggerSelectedObjectChanged = useAppStore(
    (state) => state.triggerSelectedObjectChanged
  );

  const continuousUpdateRef = useRef<ReturnType<
    typeof makeContinuousUpdate
  > | null>(null);

  const handleSelectedObjectChanges = useCallback(
    (_event: any) => {
      if (selectedObjectRef.current) {
        if (
          selectedObjectRef.current instanceof THREE.OrthographicCamera ||
          selectedObjectRef.current instanceof THREE.PerspectiveCamera
        ) {
          selectedObjectRef.current.updateProjectionMatrix();
        }
        if (selectedObjectRef.current instanceof THREE.Light) {
          selectedObjectRef.current.shadow?.camera?.updateProjectionMatrix();
        }
        triggerSelectedObjectChanged();
      }
    },
    [triggerSelectedObjectChanged]
  );

  const handleCustomParamsChanges = useCallback(
    (_event: any) => {
      triggerCPanelCustomParamsChanged();
    },
    [triggerCPanelCustomParamsChanged]
  );

  // Set selectedObject
  useEffect(() => {
    selectedObjectRef.current = selectedObject;
  }, [selectedObject]);

  // Instantiate Pane and create tabs
  useEffect(() => {
    if (paneRef.current) {
      paneRef.current.hidden = !cPanelVisible;
      if (!cPanelVisible) {
        continuousUpdateRef.current?.stop();
      } else if (cPanelContinuousUpdate) {
        continuousUpdateRef.current?.start();
      }
      return;
    }

    paneRef.current = new Pane({
      container: panelContainer
    });

    paneRef.current.registerPlugin(KVEBundle);
    continuousUpdateRef.current = makeContinuousUpdate(paneRef.current);
    paneRef.current.hidden = !cPanelVisible;
    paneRef.current['containerElem_'].classList.add('cpanel');
    const pane = paneRef.current;

    // prettier-ignore
    pane.addTab({ pages: [{ title: 'Selected' }, { title: 'Custom' }, { title: 'Global' }] });
    [...pane.children[0].element.children[0].children].forEach((tab) => {
      tab.classList.add('cpanel-tab'); // to style them hover-able
    });
  }, [cPanelVisible, cPanelContinuousUpdate]);

  // Dismiss Pane on unmount
  useEffect(() => {
    return () => {
      continuousUpdateRef.current?.stop();
      paneRef.current?.dispose();
    };
  }, []);

  // Start/Stop continuous update
  useEffect(() => {
    cPanelContinuousUpdate && cPanelVisible
      ? continuousUpdateRef.current?.start()
      : continuousUpdateRef.current?.stop();
  }, [cPanelContinuousUpdate, cPanelVisible]);

  // Create folders and bindings for selectedObject
  useEffect(() => {
    if (!paneRef.current) return;
    const pane = paneRef.current;

    const tabs = pane.children[0] as TabApi;
    const objectTab = tabs.pages[0];

    // Cleanup prev folders and their bindings
    cleanupContainer(objectTab);
    if (!selectedObject) return;

    buildBindings(
      objectTab as unknown as FolderApi,
      useAppStore.getState(),
      getObjectsStoreBindings(),
      { scene, camera }
    );

    const objectFolder = objectTab
      .addFolder({
        title: 'Object3D',
        expanded: true
      })
      .on('change', handleSelectedObjectChanges);

    buildBindings(
      objectFolder,
      selectedObject,
      getObject3DBindings({ angleFormat }),
      {
        scene,
        camera
      }
    );
  }, [
    selectedObject,
    handleSelectedObjectChanges,
    transformControlsMode,
    transformControlsSpace,
    scene,
    camera,
    angleFormat
  ]);

  // Setup bindings for custom params
  useEffect(() => {
    if (!paneRef.current) return;
    const pane = paneRef.current;
    const tabs = pane.children[0] as TabApi;
    const customParamsTab = tabs.pages[1];
    // Clear bindings
    cleanupContainer(customParamsTab);
    // Add bindings
    Object.keys(cPanelCustomParams).forEach((key) => {
      const bindingParams = cPanelCustomControls[key];
      if (!bindingParams) return;
      const binding = customParamsTab
        .addBinding(cPanelCustomParams, key, bindingParams)
        .on('change', handleCustomParamsChanges);
      tweakBindingView(binding);
      if (bindingParams.format === radToDegFormatter) {
        makeRotationBinding(binding);
      }
    });
  }, [cPanelCustomControls, cPanelCustomParams, handleCustomParamsChanges]);

  // Setup bindings for Scene/Pane
  useEffect(() => {
    if (!paneRef.current) return;
    const pane = paneRef.current;
    const tabs = pane.children[0] as TabApi;
    const sceneTab = tabs.pages[2];
    const store = useAppStore.getState();

    // Cleanup prev folders and their bindings // BladeApi is more generic we can make a recursive function to remove all children
    cleanupContainer(sceneTab);

    // Add Pane folder and bindings
    const paneFolder = sceneTab.addFolder({
      title: 'Pane',
      expanded: true
    });
    buildBindings(paneFolder, store, getPaneBindings(), {
      scene,
      camera
    });

    // Add Scene folder and bindings
    const sceneFolder = sceneTab.addFolder({
      title: 'Scene',
      expanded: true
    });

    // Add scene buttons
    buildButtons(sceneFolder, getSceneButtons({ isPlaying }), {
      scene,
      camera
    });

    const cameraEditorFolder = sceneTab.addFolder({
      title: 'Camera Editor',
      expanded: true
    });

    // Add camera editor store bindings
    buildBindings(cameraEditorFolder, store, getCameraStoreBindings(), {
      scene,
      camera
    });

    const cameraCurrentFolder = sceneTab
      .addFolder({
        title: 'Camera Current',
        expanded: true
      })
      .on('change', () => {
        camera.updateProjectionMatrix();
      });

    // Add camera object bindings
    buildBindings(
      cameraCurrentFolder,
      camera,
      getObject3DBindings({ angleFormat }),
      {
        scene,
        camera
      }
    );

    const glFolder = sceneTab
      .addFolder({
        title: 'Renderer',
        expanded: false
      })
      .on('change', () => {
        // console.log('Renderer changed');
      });

    // Add gl bindings
    buildBindings(glFolder, gl, getRendererBindings(), {
      scene,
      camera
    });

    // Add Raycaster Params
    const raycasterParamsFolder = sceneTab
      .addFolder({
        title: 'Raycaster',
        expanded: false
      })
      .on('change', () => {
        // console.log('Raycaster Params changed', raycaster);
      });

    buildBindings(
      raycasterParamsFolder,
      raycaster,
      getRaycasterParamsBindings(),
      {
        scene,
        camera
      }
    );
  }, [
    cPanelContinuousUpdate,
    angleFormat,
    isPlaying,
    cameraControl,
    attachDefaultControllersToPlayingCamera,
    cameraType,
    camera,
    scene,
    gl,
    raycaster
  ]);

  useEffect(() => {
    panelContainer.scrollTop = cPanelScrollTop;
  }, [
    // everything is a dependency here excluding cPanelVisible
    selectedObject,
    transformControlsMode,
    transformControlsSpace,
    cPanelCustomControls,
    cPanelCustomParams,
    cPanelContinuousUpdate,
    cPanelCustomParams,
    cameraControl,
    attachDefaultControllersToPlayingCamera,
    cameraType,
    camera,
    scene,
    gl,
    raycaster
  ]);

  return null;
};

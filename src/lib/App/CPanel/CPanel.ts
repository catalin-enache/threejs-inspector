import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { Pane, FolderApi, TabApi } from 'tweakpane';
// @ts-ignore
// import { Pane, FolderApi, TabApi } from 'lib/third_party/tweakpane.js';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import { useAppStore } from 'src/store';
import { makeContinuousUpdate } from './continuousUpdate';
import TexturePlugin from './Plugins/TexturePlugin';
import './manipulateMouseSpeed';
import { radToDegFormatter } from 'lib/utils';
import {
  getObject3DBindings,
  getRendererBindings,
  getPaneBindings,
  getCameraStoreBindings,
  getObjectsStoreBindings,
  getSceneButtons,
  getSceneConfigBindings,
  getRaycasterParamsBindings
} from './bindings';
import { makeRotationBinding, tweakBindingView, buildBindings, cleanupContainer } from './bindings/bindingHelpers';
// @ts-ignore
import { html } from '../../../../README.md';
import './CPanel.css';

const cPanelContainer = document.getElementById('controlPanel')!;
const helpContainer = document.getElementById('help')!;
helpContainer.innerHTML = html.replaceAll('public/', window.location.pathname.replace('/', ''));

// ----------------------- >> Remember last scroll position >> --------------------------------

let cPanelScrollTop = 0;
export const panelContainer = document.querySelector('#controlPanelContent') as HTMLElement;

function onScroll(evt: Event) {
  cPanelScrollTop = Math.round((evt.target as HTMLElement)?.scrollTop);
}
panelContainer.addEventListener('scroll', onScroll);

// Leaving the followings commented for a while until we're sure we don't need them
// remember scroll position only when user interacting with the panel (not when automatically scrolled)
// const timeoutId: NodeJS.Timeout | null = null;
// panelContainer.addEventListener('wheel', () => {
//   panelContainer.addEventListener('scroll', onScroll);
//   timeoutId && clearTimeout(timeoutId);
//   timeoutId = setTimeout(() => {
//     panelContainer.removeEventListener('scroll', onScroll);
//   }, 200);
// });

// const resizeObserver = new ResizeObserver((entries) => {
//   for (const _entry of entries) {
//     // console.log(`Element's height: ${_entry.contentRect}px`);
//     // cPanelScrollTop = panelContainer.scrollTop;
//     console.log('resizeObserver', cPanelScrollTop);
//   }
// });

// ----------------------- << Remember last scroll position << --------------------------------

// ----------------------- >> Allowing input control to be visible when dragged outside cPanel  >> --------------------------------
// fixing behaviour for controlPanelContent which is a scrolling container

panelContainer.addEventListener('pointerdown', (evt) => {
  let walker: HTMLElement = evt.target as HTMLElement;
  if (!walker) return;
  while (walker) {
    walker = walker?.parentNode as HTMLElement;
    if (!walker) return;
    if (walker.id === 'controlPanelContent') {
      // fixing cPanel hiding inner content when dragged outside
      walker.classList.add('cPanel-mousedown');
      // @ts-ignore
      panelContainer.children[0].style.transform = `translateY(${-cPanelScrollTop}px)`;
      break;
    }
  }
});

document.addEventListener('pointerup', () => {
  document.querySelectorAll('.cPanel-mousedown').forEach((el) => {
    // setTimeout is for Firefox which keeps the draggable attached to mouse
    setTimeout(() => {
      el.classList.remove('cPanel-mousedown');
      // @ts-ignore
      panelContainer.children[0].style.transform = `translateY(${0}px)`;
    });
  });
});

// ----------------------- << Allowing input control to be visible when dragged outside cPanel  << --------------------------------

const preventContextMenu = (evt: globalThis.MouseEvent) => {
  evt.preventDefault();
};

panelContainer.addEventListener('contextmenu', preventContextMenu);
helpContainer.addEventListener('contextmenu', preventContextMenu);

export const CPanel = () => {
  const { camera, scene, gl, raycaster } = useThree();
  const isPlaying = useAppStore((state) => state.isPlaying);
  const paneRef = useRef<Pane | null>(null);
  const cameraControl = useAppStore((state) => state.cameraControl);
  const attachDefaultControllersToPlayingCamera = useAppStore((state) => state.attachDefaultControllersToPlayingCamera);
  const cameraType = useAppStore((state) => state.cameraType);
  const transformControlsMode = useAppStore((state) => state.transformControlsMode);
  const transformControlsSpace = useAppStore((state) => state.transformControlsSpace);
  const cPanelContinuousUpdate = useAppStore((state) => state.cPanelContinuousUpdate);
  const cPanelStateFake = useAppStore((state) => state.cPanelStateFake);
  const angleFormat = useAppStore((state) => state.angleFormat);

  const cPanelVisible = useAppStore((state) => state.cPanelVisible);
  const setCPanelOpacity = useAppStore((state) => state.setCPanelOpacity);
  const setCPanelSize = useAppStore((state) => state.setCPanelSize);
  const cPanelCustomParams = useAppStore((state) => state.getCPanelCustomParams());
  const triggerCPanelCustomParamsChanged = useAppStore((state) => state.triggerCPanelCustomParamsChanged);
  const cPanelCustomControls = useAppStore((state) => state.cPanelCustomControls);
  const selectedObject = useAppStore((state) => state.selectedObject);
  const selectedObjectRef = useRef<THREE.Object3D | null>(null);
  const triggerSelectedObjectChanged = useAppStore((state) => state.triggerSelectedObjectChanged);

  const continuousUpdateRef = useRef<ReturnType<typeof makeContinuousUpdate> | null>(null);

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
      paneRef.current.hidden = !cPanelVisible; // switch at Tweakpane level
      cPanelContainer.style.display = cPanelVisible ? 'block' : 'none'; // switch at higher node in the DOM
      if (!cPanelVisible) {
        continuousUpdateRef.current?.stop();
        // resizeObserver.disconnect();
      } else if (cPanelContinuousUpdate) {
        continuousUpdateRef.current?.start();
        // resizeObserver.observe(panelContainer.children[0]);
      }
      return;
    }

    // The followings in current useEffect are for the first time setup
    paneRef.current = new Pane({
      container: panelContainer
    });
    // resizeObserver.observe(panelContainer.children[0]);

    paneRef.current.registerPlugin(TexturePlugin);
    paneRef.current.registerPlugin(EssentialsPlugin);
    continuousUpdateRef.current = makeContinuousUpdate(paneRef.current);
    const pane = paneRef.current;

    pane.addTab({ pages: [{ title: 'Selected' }, { title: 'Custom' }, { title: 'Global' }] });
    [...pane.children[0].element.children[0].children].forEach((tab, idx) => {
      tab.classList.add('cPanel-tab'); // to style them hover-able
      if (idx === 2) {
        // select the Global tab by default
        tab.children[0].dispatchEvent(new Event('click'));
      }
    });
  }, [cPanelVisible, cPanelContinuousUpdate]);

  // Dismiss Pane on unmount
  useEffect(() => {
    const currentOpacity = +getComputedStyle(document.documentElement)
      .getPropertyValue('--tp-base-background-opacity')
      .trim();
    setCPanelOpacity(currentOpacity);
    const currentSize = parseInt(getComputedStyle(cPanelContainer).getPropertyValue('--cPanelWidth').trim(), 10);
    setCPanelSize(currentSize);
    return () => {
      continuousUpdateRef.current?.stop();
      paneRef.current?.dispose();
      // resizeObserver.disconnect();
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
      getObjectsStoreBindings({ sceneObjects: { scene, camera, gl } })
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
      getObject3DBindings({
        angleFormat,
        isPlaying,
        sceneObjects: {
          scene,
          camera,
          gl
        }
      })
    );
  }, [
    selectedObject,
    handleSelectedObjectChanges,
    transformControlsMode,
    transformControlsSpace,
    scene,
    camera,
    gl,
    angleFormat,
    isPlaying,
    cPanelStateFake
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
      // Forcing all pickers inline to prevent layout issues.
      // Not all bindings have pickers but there's no harm in setting it inline even if there's no picker
      bindingParams.picker = 'inline';
      const binding = customParamsTab
        .addBinding(cPanelCustomParams, key, bindingParams)
        .on('change', handleCustomParamsChanges);
      tweakBindingView(binding);
      if (bindingParams.format === radToDegFormatter) {
        makeRotationBinding(binding);
      }
    });
  }, [cPanelCustomControls, cPanelCustomParams, handleCustomParamsChanges, cPanelStateFake]);

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
    buildBindings(
      paneFolder,
      store,
      getPaneBindings({
        sceneObjects: {
          scene,
          camera,
          gl
        }
      })
    );

    // Add Scene folder and bindings
    const sceneFolder = sceneTab.addFolder({
      title: 'Scene Config & Actions',
      expanded: true
    });

    // Add scene buttons
    buildBindings(
      sceneFolder,
      {},
      getSceneButtons({
        angleFormat,
        isPlaying,
        sceneObjects: {
          scene,
          camera,
          gl
        }
      })
    );

    const cameraEditorFolder = sceneTab.addFolder({
      title: 'Camera Control',
      expanded: true
    });

    // Add camera editor store bindings
    buildBindings(
      cameraEditorFolder,
      store,
      getCameraStoreBindings({
        sceneObjects: {
          scene,
          camera,
          gl
        }
      })
    );

    const sceneConfigFolder = sceneTab.addFolder({
      title: 'Scene',
      expanded: false
    });

    // Add scene config bindings
    buildBindings(
      sceneConfigFolder,
      scene,
      getSceneConfigBindings({
        angleFormat,
        isPlaying,
        sceneObjects: {
          scene,
          camera,
          gl
        }
      })
    );

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
      getObject3DBindings({
        angleFormat,
        isPlaying,
        sceneObjects: {
          scene,
          camera,
          gl
        }
      })
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
    buildBindings(
      glFolder,
      gl,
      getRendererBindings({
        sceneObjects: {
          scene,
          camera,
          gl
        }
      })
    );

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
      getRaycasterParamsBindings({
        sceneObjects: {
          scene,
          camera,
          gl
        }
      })
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
    raycaster,
    cPanelStateFake
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
    raycaster,
    angleFormat,
    isPlaying,
    cPanelStateFake
  ]);

  return null;
};

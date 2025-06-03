import { useEffect, useRef, useCallback, useMemo, MutableRefObject } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { Pane, FolderApi } from 'tweakpane';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { useAppStore } from 'src/store';
import { SceneSizeHelper } from 'components/Helpers/SceneSizeHelper';
import { makeContinuousUpdate } from './continuousUpdate';
import TexturePlugin from './Plugins/TexturePlugin';
import { manipulateMouseSpeed } from './manipulateMouseSpeed';
import { injectMainCss } from 'lib/cssInjector';

import {
  getObject3DBindings,
  getRendererBindings,
  getExperiencesBindings,
  getPaneBindings,
  getCameraStoreBindings,
  getObjectsStoreBindings,
  getSceneButtons,
  getSceneConfigBindings,
  getRaycasterParamsBindings
} from './bindings';
import {
  buildBindings,
  cleanupContainer,
  buildCustomParams,
  getPaneTab,
  setSelectedTab,
  eventListenersMap as _eventListenersMap // log this when in doubt that all event listeners have been removed
} from './bindings/bindingHelpers';
// @ts-ignore
import { outliner } from 'lib/third_party/ui.outliner';
// @ts-ignore
import { html } from '../../../README.md';
import { CommonGetterParams } from './bindings/bindingTypes';
import { LoadObjectForm } from '../LoadObjectForm/LoadObjectForm';
import './CPanel.css';

const cPanel = document.createElement('div');
cPanel.id = 'controlPanel';
cPanel.innerHTML = `
<div id="dragMe"></div>
<div id="help" style="display: none"></div>
<div id="controlPanelContent"></div>
`;
document.body.appendChild(cPanel);

gsap.registerPlugin(Draggable);
Draggable.create('#controlPanel', {
  trigger: '#dragMe',
  minimumMovement: 0
});

const cPanelContent = document.getElementById('controlPanelContent')!;

const dragMe = document.getElementById('dragMe')!;
dragMe.addEventListener('click', () => {
  cPanelContent.style.display = cPanelContent.style.display === 'none' ? 'block' : 'none';
});

const cPanelContainer = document.getElementById('controlPanel')!;
const helpContainer = document.getElementById('help')!;
// "public/textures" is used in GitHub repo description while "textures" is used in running app in help section.
// We share the same README.md file for both, so we need to replace the path in the help section.
helpContainer.innerHTML = html.replaceAll('public/textures', 'textures');

cPanelContent.addEventListener('mousedown', manipulateMouseSpeed, true);

// ----------------------- >> Remember last scroll position >> --------------------------------

let cPanelScrollTop = 0;
export const panelContainer = document.querySelector('#controlPanelContent') as HTMLElement;

function onScroll(evt: Event) {
  cPanelScrollTop = Math.round((evt.target as HTMLElement)?.scrollTop);
}
panelContainer.addEventListener('scroll', onScroll);

// ----------------------- << Remember last scroll position << --------------------------------

// ----------------------- >> Allowing input control to be visible when dragged outside cPanel  >> --------------------------------
// fixing behaviour for controlPanelContent which is a scrolling container

panelContainer.addEventListener('pointerdown', (evt) => {
  let walker: HTMLElement = evt.target as HTMLElement;
  if (!walker) return;
  while (walker) {
    walker = walker?.parentNode as HTMLElement;
    if (!walker) return;
    // binding-value is set when defining bindings in bindingHelpers
    if (walker.classList.contains('binding-value')) {
      // here's we mark the current one to read it on "pointerup"
      walker.classList.add('binding-value-current');
    }
    if (walker.id === 'controlPanelContent') {
      // fixing cPanel hiding inner content when dragged outside
      walker.classList.add('cPanel-mousedown');
      // @ts-ignore
      panelContainer.children[0].style.transform = `translateY(${-cPanelScrollTop}px)`;
      break;
    }
  }
});

document.addEventListener('pointerup', (evt) => {
  let releasedOnCurrentBindingValue = false;
  let walker: HTMLElement = evt.target as HTMLElement;

  while (walker) {
    walker = walker?.parentNode as HTMLElement;
    if (!walker) break;
    if (walker.classList?.contains('binding-value-current')) {
      releasedOnCurrentBindingValue = true;
      break;
    }
  }

  // fixing Tweakpane dragging handlers not being released when "pointerup" / "mouseup" is fired from disabled inputs.
  if (!releasedOnCurrentBindingValue) {
    document.querySelectorAll('.binding-value-current *').forEach((el) => {
      // Dispatching "mouseup" event to release the handle. Tewakpane listens for "mouseup" not for "pointerup" event.
      el.dispatchEvent(
        new PointerEvent('mouseup', {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: evt.clientX,
          clientY: evt.clientY
        })
      );
    });
  }

  // cleanup
  document.querySelectorAll('.binding-value-current').forEach((el) => {
    el.classList.remove('binding-value-current');
  });

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

const searchInput = document.createElement('input');
searchInput.placeholder = 'Search...';
searchInput.spellcheck = false;
searchInput.classList.add('outlinerSearch');
searchInput.classList.add('tp-txtv_i'); // reuse style from Tweakpane
searchInput.addEventListener('input', (evt) => {
  useAppStore.getState().setOutlinerSearch((evt.target as HTMLInputElement).value);
});

export interface CPanelProps {
  onCPanelReady?: (
    pane: Pane,
    { commonGetterParamsRef }: { commonGetterParamsRef: MutableRefObject<CommonGetterParams> }
  ) => void;
  onCPanelUnmounted?: () => void;
}

export const CPanel = (props: CPanelProps) => {
  void injectMainCss();
  const { onCPanelReady, onCPanelUnmounted } = props;
  const { camera, scene, gl, raycaster, frameloop } = useThree();
  const playingState = useAppStore((state) => state.playingState);
  const paneRef = useRef<Pane | null>(null);
  const attachDefaultControllersToPlayingCamera = useAppStore((state) => state.attachDefaultControllersToPlayingCamera);
  const cameraType = useAppStore((state) => state.cameraType);
  const transformControlsMode = useAppStore((state) => state.transformControlsMode);
  const transformControlsSpace = useAppStore((state) => state.transformControlsSpace);
  const cPanelContinuousUpdate = useAppStore((state) => state.cPanelContinuousUpdate);
  const cPanelStateFake = useAppStore((state) => state.cPanelStateFake);
  const angleFormat = useAppStore((state) => state.angleFormat);
  const showAxesHelper = useAppStore((state) => state.showAxesHelper);
  const showGridHelper = useAppStore((state) => state.showGridHelper);
  const showSceneSizeHelper = useAppStore((state) => state.showSceneSizeHelper);

  const experiences = useAppStore((state) => state.experiences);

  const cPanelVisible = useAppStore((state) => state.cPanelVisible);
  const selectedObjectUUID = useAppStore((state) => state.selectedObjectUUID);
  const selectedObjectRef = useRef<THREE.Object3D | null>(null);
  const triggerSelectedObjectChanged = useAppStore((state) => state.triggerSelectedObjectChanged);

  const cPanelCustomParams = useAppStore((state) => state.getCPanelCustomParams());
  const cPanelCustomParamsStructureStateFake = useAppStore((state) => state.cPanelCustomParamsStructureStateFake);

  const continuousUpdateRef = useRef<ReturnType<typeof makeContinuousUpdate> | null>(null);

  // In later useEffects the dependencies are already the ones used here.
  // No need to add commonGetterParams as a dependency.
  const commonGetterParams: CommonGetterParams = useMemo(
    () => ({ angleFormat, playingState, pane: paneRef, sceneObjects: { scene, camera, gl } }),
    [angleFormat, playingState, scene, camera, gl]
  );
  const commonGetterParamsRef = useRef(commonGetterParams);
  commonGetterParamsRef.current = commonGetterParams;

  const handleSelectedObjectChanges = useCallback(
    (_event: any) => {
      if (selectedObjectRef.current) {
        triggerSelectedObjectChanged();
      }
    },
    [triggerSelectedObjectChanged]
  );

  const handleClearScene = useCallback(() => {
    [0, 1, 2].forEach((index) => {
      if (!paneRef.current) return;
      cleanupContainer(getPaneTab(paneRef.current, index), { disposeRootFolder: true });
    });
    useAppStore.getState().clearCPanelCustomParams();
    useAppStore.getState().triggerCPanelStateChanged(); // to repopulate scene tab by rebuilding the scene bindings
  }, []);

  useEffect(() => {
    window.addEventListener('TIFMK.ClearScene', handleClearScene);
    return () => {
      window.removeEventListener('TIFMK.ClearScene', handleClearScene);
    };
  }, [handleClearScene]);

  // Instantiate Pane, create tabs and Dismiss Pane on unmount
  useEffect(() => {
    const cPanelVisible = useAppStore.getState().cPanelVisible;
    // The followings in current useEffect are for the first time setup
    paneRef.current = new Pane({
      container: panelContainer
    });

    paneRef.current.registerPlugin(TexturePlugin);
    paneRef.current.registerPlugin(EssentialsPlugin);

    paneRef.current.hidden = !cPanelVisible; // switch at Tweakpane level
    cPanelContainer.style.display = cPanelVisible ? 'block' : 'none';

    continuousUpdateRef.current = makeContinuousUpdate(paneRef.current);
    const pane = paneRef.current;

    pane.addTab({ pages: [{ title: 'Selected' }, { title: 'Custom Controls' }, { title: 'Global' }] });
    [...pane.children[0].element.children[0].children].forEach((tab) => {
      tab.classList.add('cPanel-tab'); // to style them hover-able
    });

    const objectTab = getPaneTab(pane, 0);

    objectTab.element.prepend(outliner.dom);
    objectTab.element.prepend(searchInput);

    const docStyle = document.documentElement.style;

    const storedCPanelOpacity = localStorage.getItem('threeInspector__cPanelOpacity');
    const currentOpacity = +getComputedStyle(document.documentElement)
      .getPropertyValue('--tp-base-background-opacity')
      .trim();
    !storedCPanelOpacity && useAppStore.getState().setCPanelOpacity(currentOpacity);
    storedCPanelOpacity && docStyle.setProperty('--tp-base-background-opacity', storedCPanelOpacity);

    const storedCPanelSize = localStorage.getItem('threeInspector__cPanelSize');
    const currentSize = parseInt(getComputedStyle(cPanelContainer).getPropertyValue('--cPanelWidth').trim(), 10);
    !storedCPanelSize && useAppStore.getState().setCPanelSize(currentSize);
    storedCPanelSize && cPanelContainer.style.setProperty('--cPanelWidth', storedCPanelSize + 'px');

    onCPanelReady?.(paneRef.current!, { commonGetterParamsRef });

    return () => {
      continuousUpdateRef.current?.stop();
      continuousUpdateRef.current = null;
      if (paneRef.current) {
        [0, 1, 2].forEach((index) => {
          if (!paneRef.current) return;
          cleanupContainer(getPaneTab(paneRef.current, index), { disposeRootFolder: true });
        });
      }
      paneRef.current?.dispose();
      onCPanelUnmounted?.();
    };
  }, []);

  // Start/Stop continuous update and show/hide cPanel
  useEffect(() => {
    if (!paneRef.current) return;

    paneRef.current.hidden = !cPanelVisible; // switch at Tweakpane level
    cPanelContainer.style.display = cPanelVisible ? 'block' : 'none'; // switch at higher node in the DOM

    cPanelContinuousUpdate && cPanelVisible
      ? continuousUpdateRef.current?.start()
      : continuousUpdateRef.current?.stop();
  }, [cPanelVisible, cPanelContinuousUpdate]);

  // select CustomParams initially
  useEffect(() => {
    if (!paneRef.current || paneRef.current.hidden) return;
    setSelectedTab(paneRef.current, 1);
  }, []);

  // select object tab when an object is selected
  useEffect(() => {
    if (!paneRef.current || paneRef.current.hidden) return;
    if (selectedObjectUUID && selectedObjectRef.current?.uuid !== selectedObjectUUID) {
      setSelectedTab(paneRef.current, 0);
    }
  }, [cPanelCustomParams, cPanelCustomParamsStructureStateFake, selectedObjectUUID]);

  // Set selectedObject
  useEffect(() => {
    selectedObjectRef.current = useAppStore.getState().getSelectedObject();
  }, [selectedObjectUUID]);

  // Create folders and bindings for selectedObject
  useEffect(() => {
    if (!paneRef.current || paneRef.current.hidden) return;
    const pane = paneRef.current;

    const objectTab = getPaneTab(pane, 0);

    // Cleanup prev folders and their bindings
    cleanupContainer(objectTab, { disposeRootFolder: true });
    // console.log('after cleanup selectedObject tab eventListenersMap.size', _eventListenersMap.size);
    if (!selectedObjectUUID) {
      outliner.setValue(null);
      return;
    }
    const selectedObject = useAppStore.getState().getSelectedObject();
    // TODO: in unit test it warns about converting to jpg due to performance reasons when we log selectedObject
    console.log('selectedObject', selectedObject); // this console should stay around
    outliner.setValue(selectedObject?.id || null);

    // TCMode, TCSpace buttons
    buildBindings(
      objectTab as unknown as FolderApi,
      useAppStore.getState(),
      getObjectsStoreBindings(commonGetterParams),
      commonGetterParams
    );

    const objectFolder = objectTab
      .addFolder({
        title: 'Object3D',
        expanded: true
      })
      .on('change', handleSelectedObjectChanges);

    buildBindings(objectFolder, selectedObject, getObject3DBindings(commonGetterParams), commonGetterParams);
  }, [
    selectedObjectUUID,
    commonGetterParams,
    transformControlsMode,
    transformControlsSpace,
    handleSelectedObjectChanges,
    cPanelStateFake
  ]);

  // Setup bindings for custom params
  useEffect(() => {
    if (!paneRef.current || paneRef.current.hidden) return;
    const pane = paneRef.current;
    const customParamsTab = getPaneTab(pane, 1);
    // Clear bindings
    cleanupContainer(customParamsTab, { disposeRootFolder: true });
    buildCustomParams({
      cPanelCustomParams,
      customParamsTab
    });
  }, [cPanelCustomParams, cPanelCustomParamsStructureStateFake, cPanelStateFake]);

  // Setup bindings for Scene/Pane
  useEffect(() => {
    if (!paneRef.current || paneRef.current.hidden) return;
    const pane = paneRef.current;
    const sceneTab = getPaneTab(pane, 2);
    const store = useAppStore.getState();

    // Cleanup prev folders and their bindings // BladeApi is more generic we can make a recursive function to remove all children
    cleanupContainer(sceneTab, { disposeRootFolder: true });

    if (experiences && experiences.length) {
      const experienceFolder = sceneTab.addFolder({
        title: 'Experiences',
        expanded: true
      });
      buildBindings(experienceFolder, store, getExperiencesBindings(commonGetterParams), commonGetterParams);
    }

    // Add Pane folder and bindings
    const paneFolder = sceneTab.addFolder({
      title: 'Pane',
      expanded: true
    });
    buildBindings(paneFolder, store, getPaneBindings(commonGetterParams), commonGetterParams);

    // Add Scene folder and bindings
    const sceneFolder = sceneTab.addFolder({
      title: 'Scene Config & Actions',
      expanded: true
    });

    // Add scene buttons
    buildBindings(
      sceneFolder,
      {
        gizmoSize: useAppStore.getState().gizmoSize,
        // TODO: allow this option on delete modal
        destroyOnRemove: useAppStore.getState().destroyOnRemove,
        frameLoop: frameloop
      },
      getSceneButtons(commonGetterParams),
      commonGetterParams
    );

    // if there is at least something to show, create the folder
    if (!useAppStore.getState().isInjected) {
      const cameraEditorFolder = sceneTab.addFolder({
        title: 'Camera Control',
        expanded: true
      });

      // Add camera editor store bindings
      buildBindings(cameraEditorFolder, store, getCameraStoreBindings(commonGetterParams), commonGetterParams);
    }

    const sceneConfigFolder = sceneTab.addFolder({
      title: 'Scene',
      expanded: false
    });

    // Add scene config bindings
    buildBindings(sceneConfigFolder, scene, getSceneConfigBindings(commonGetterParams), commonGetterParams);

    const cameraCurrentFolder = sceneTab
      .addFolder({
        title: 'Camera Current',
        expanded: true
      })
      .on('change', () => {
        // console.log('Camera Current changed');
      });

    // Add camera object bindings
    buildBindings(cameraCurrentFolder, camera, getObject3DBindings(commonGetterParams), commonGetterParams);

    const glFolder = sceneTab
      .addFolder({
        title: 'Renderer',
        expanded: false
      })
      .on('change', () => {
        // console.log('Renderer changed');
      });

    // Add gl bindings
    buildBindings(glFolder, gl, getRendererBindings(commonGetterParams), commonGetterParams);

    // Add Raycaster Params
    const raycasterParamsFolder = sceneTab
      .addFolder({
        title: 'Inspector Raycaster',
        expanded: false
      })
      .on('change', () => {
        // console.log('Raycaster Params changed', raycaster);
      });

    buildBindings(raycasterParamsFolder, raycaster, getRaycasterParamsBindings(commonGetterParams), commonGetterParams);
  }, [
    commonGetterParams,
    cPanelContinuousUpdate,
    angleFormat,
    playingState,
    attachDefaultControllersToPlayingCamera,
    cameraType,
    camera,
    scene,
    gl,
    frameloop,
    raycaster,
    cPanelStateFake,
    experiences
  ]);

  useEffect(() => {
    panelContainer.scrollTop = cPanelScrollTop;
  }, [
    // everything is a dependency here excluding cPanelVisible
    selectedObjectUUID,
    transformControlsMode,
    transformControlsSpace,
    cPanelCustomParams,
    cPanelContinuousUpdate,
    attachDefaultControllersToPlayingCamera,
    cameraType,
    camera,
    scene,
    gl,
    raycaster,
    angleFormat,
    playingState,
    cPanelStateFake,
    experiences
  ]);

  return (
    <>
      <LoadObjectForm />
      {showAxesHelper && <axesHelper args={[1000]} />}
      {showGridHelper && <gridHelper args={[1000, 1000]} />}
      {showSceneSizeHelper && <SceneSizeHelper />}
    </>
  );
};

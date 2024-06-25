import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
// import { devtools } from 'zustand/middleware';
// import type {} from '@redux-devtools/extension'; // required for devtools typing
import * as THREE from 'three';
import { setFullScreen } from 'lib/utils/fullScreenUtils';

const cPanelCustomParamsStore: any = {};
let selectedObject: THREE.Object3D | null = null;

const showAxisHelper = localStorage.getItem('threeInspector__showAxesHelper')
  ? localStorage.getItem('threeInspector__showAxesHelper') === 'true'
  : true;

const showGridHelper = localStorage.getItem('threeInspector__showGridHelper')
  ? localStorage.getItem('threeInspector__showGridHelper') === 'true'
  : true;

const showGizmos = localStorage.getItem('threeInspector__showGizmos')
  ? localStorage.getItem('threeInspector__showGizmos') === 'true'
  : true;

const showHelpers =
  showGizmos && localStorage.getItem('threeInspector__showHelpers')
    ? localStorage.getItem('threeInspector__showHelpers') === 'true'
    : true;

const angleFormat = (
  localStorage.getItem('threeInspector__angleFormat') ? localStorage.getItem('threeInspector__angleFormat') : 'deg'
) as 'deg' | 'rad';

const cameraControl = (
  localStorage.getItem('threeInspector__cameraControl')
    ? localStorage.getItem('threeInspector__cameraControl')
    : 'orbit'
) as 'orbit' | 'fly';

const cameraType = (
  localStorage.getItem('threeInspector__cameraType')
    ? localStorage.getItem('threeInspector__cameraType')
    : 'perspective'
) as 'perspective' | 'orthographic';

const cPanelOpacity = localStorage.getItem('threeInspector__cPanelOpacity')
  ? +(localStorage.getItem('threeInspector__cPanelOpacity') || 0)
  : 0;

export interface AppStore {
  isInjected: boolean;
  setIsInjected: (isInjected: boolean) => void;
  outlinerSearch: string;
  setOutlinerSearch: (outlinerSearch: string) => void;
  autoNavControls: boolean;
  setAutoNavControls: (autoNavControls: boolean) => void;
  playingState: 'stopped' | 'playing' | 'paused';
  setPlaying: (playingState: AppStore['playingState']) => void;
  angleFormat: 'deg' | 'rad';
  setAngleFormat: (angleFormat: 'deg' | 'rad') => void;
  toggleAngleFormat: () => void;
  shiftKeyPressed: boolean;
  setShiftKeyPressed: (shiftKeyPressed: boolean) => void;
  controlKeyPressed: boolean;
  setControlKeyPressed: (controlKeyPressed: boolean) => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  transformControlsMode: 'translate' | 'rotate' | 'scale';
  setTransformControlsMode: (mode: 'translate' | 'rotate' | 'scale') => void;
  transformControlsSpace: 'world' | 'local';
  setTransformControlsSpace: (space: 'world' | 'local') => void;
  isDraggingTransformControls: boolean;
  setIsDraggingTransformControls: (isDraggingTransformControls: boolean) => void;
  showGizmos: boolean;
  setShowGizmos: (showGizmos: boolean) => void;
  toggleShowGizmos: () => void;
  showHelpers: boolean;
  setShowHelpers: (showHelpers: boolean) => void;
  toggleShowHelpers: () => void;
  gizmoSize: number;
  setGizmoSize: (gizmoSize: number) => void;
  showAxesHelper: boolean;
  setShowAxesHelper: (showAxesHelper: boolean) => void;
  toggleShowAxesHelper: () => void;
  showGridHelper: boolean;
  setShowGridHelper: (showGridHelper: boolean) => void;
  toggleShowGridHelper: () => void;
  cPanelShowHelp: boolean;
  setCPanelShowHelp: (show: boolean) => void;
  toggleCPanelShowHelp: () => void;
  cPanelOpacity: number;
  setCPanelOpacity: (opacity: number) => void;
  cPanelSize: number;
  setCPanelSize: (size: number) => void;
  cPanelVisible: boolean;
  setCPanelVisible: (cPanelVisible: boolean) => void;
  toggleCPanelVisibility: () => void;
  cPanelContinuousUpdate: boolean;
  setCPanelContinuousUpdate: (cPanelContinuousUpdate: boolean) => void;
  toggleCPanelContinuousUpdate: () => void;
  cPanelStateFake: number;
  triggerCPaneStateChanged: () => void;
  getCPanelCustomParams: () => typeof cPanelCustomParamsStore;
  setOrUpdateCPanelCustomParams: (name: string, object: any, prop: string, control: any, path: string[]) => void;
  removeCPanelCustomParams: (name: string, path: string[]) => void;
  cPanelCustomParamsStructureStateFake: number;
  triggerCPanelCustomParamsStructureChanged: () => void;
  loadModelIsOpen: boolean;
  setLoadModelIsOpen: (isOpen: boolean) => void;
  cameraControl: 'orbit' | 'fly';
  setCameraControl: (type: 'orbit' | 'fly') => void;
  toggleCameraControl: () => void;
  cameraType: 'perspective' | 'orthographic';
  setCameraType: (type: 'perspective' | 'orthographic') => void;
  toggleCameraType: () => void;
  currentCameraStateFake: number;
  triggerCurrentCameraChanged: () => void;
  attachDefaultControllersToPlayingCamera: boolean;
  setAttachDefaultControllersToPlayingCamera: (attachDefaultControllersToPlayingCamera: boolean) => void;
  toggleAttachDefaultControllersToPlayingCamera: () => void;
  selectedObjectUUID: string;
  getSelectedObject: () => THREE.Object3D | null;
  setSelectedObject: (object?: THREE.Object3D | null) => void;
  selectedObjectStateFake: number;
  triggerSelectedObjectChanged: () => void;
  deleteSelectedObject: () => void;
}

export const useAppStore = create<AppStore>()(
  // devtools makes cPanel continuous update (when playing) very slow when displaying materials (hard to serialize). So we're disabling it.
  // devtools(
  subscribeWithSelector((set, get) => ({
    isInjected: true,
    setIsInjected: (isInjected) => set({ isInjected }),
    outlinerSearch: '',
    setOutlinerSearch: (outlinerSearch) => set({ outlinerSearch }),
    autoNavControls: false,
    setAutoNavControls: (autoNavControls) => set({ autoNavControls }),
    playingState: 'stopped',
    setPlaying: (playingState) => {
      if (get().isDraggingTransformControls) return;
      set({ playingState });
    },
    angleFormat: angleFormat,
    setAngleFormat: (angleFormat) => {
      set({ angleFormat });
      localStorage.setItem('threeInspector__angleFormat', angleFormat);
    },
    toggleAngleFormat: () => {
      set((state) => ({
        angleFormat: state.angleFormat === 'deg' ? 'rad' : 'deg'
      }));
      localStorage.setItem('threeInspector__angleFormat', get().angleFormat);
    },
    shiftKeyPressed: false,
    setShiftKeyPressed: (shiftKeyPressed) => set({ shiftKeyPressed }),
    controlKeyPressed: false,
    setControlKeyPressed: (controlKeyPressed) => set({ controlKeyPressed }),
    isFullscreen:
      // @ts-ignore
      document.fullscreenElement || document.webkitFullscreenElement,
    toggleFullscreen: () => {
      setFullScreen(
        // @ts-ignore
        !(document.fullscreenElement || document.webkitFullscreenElement)
      );
    },
    transformControlsMode: 'translate',
    setTransformControlsMode: (mode) => set({ transformControlsMode: mode }),
    transformControlsSpace: 'world',
    setTransformControlsSpace: (space) => set({ transformControlsSpace: space }),
    isDraggingTransformControls: false,
    setIsDraggingTransformControls: (isDraggingTransformControls) => set({ isDraggingTransformControls }),
    showGizmos: showGizmos,
    setShowGizmos: (showGizmos) => {
      set({ showGizmos, showHelpers: showGizmos });
      localStorage.setItem('threeInspector__showGizmos', showGizmos.toString());
      localStorage.setItem('threeInspector__showHelpers', showGizmos.toString());
    },
    toggleShowGizmos: () => {
      set((state) => ({
        showGizmos: !state.showGizmos,
        showHelpers: !state.showGizmos
      }));
      localStorage.setItem('threeInspector__showGizmos', get().showGizmos.toString());
      localStorage.setItem('threeInspector__showHelpers', get().showHelpers.toString());
    },
    showHelpers: showHelpers,
    setShowHelpers: (showHelpers) => {
      set({ showHelpers });
      localStorage.setItem('threeInspector__showHelpers', showHelpers.toString());
    },
    toggleShowHelpers: () => {
      set((state) => ({
        showHelpers: !state.showHelpers
      }));
      localStorage.setItem('threeInspector__showHelpers', get().showHelpers.toString());
    },
    gizmoSize: +(localStorage.getItem('threeInspector__gizmoSize') || 0.25),
    setGizmoSize: (gizmoSize) => {
      set({ gizmoSize });
      localStorage.setItem('threeInspector__gizmoSize', gizmoSize.toString());
    },
    showAxesHelper: showAxisHelper,
    setShowAxesHelper: (showAxesHelper) => {
      set({ showAxesHelper });
      localStorage.setItem('threeInspector__showAxesHelper', showAxesHelper.toString());
    },
    toggleShowAxesHelper: () => {
      set((state) => ({
        showAxesHelper: !state.showAxesHelper
      }));
      localStorage.setItem('threeInspector__showAxesHelper', get().showAxesHelper.toString());
    },
    showGridHelper: showGridHelper,
    setShowGridHelper: (showGridHelper) => {
      set({ showGridHelper });
      localStorage.setItem('threeInspector__showGridHelper', showGridHelper.toString());
    },
    toggleShowGridHelper: () => {
      set((state) => ({
        showGridHelper: !state.showGridHelper
      }));
      localStorage.setItem('threeInspector__showGridHelper', get().showGridHelper.toString());
    },
    cPanelShowHelp: false,
    setCPanelShowHelp: (cPanelShowHelp) => set({ cPanelShowHelp }),
    toggleCPanelShowHelp: () => {
      set((state) => ({
        cPanelShowHelp: !state.cPanelShowHelp
      }));
    },
    cPanelOpacity: cPanelOpacity,
    setCPanelOpacity: (cPanelOpacity) => {
      set({ cPanelOpacity });
      localStorage.setItem('threeInspector__cPanelOpacity', cPanelOpacity.toString());
    },
    cPanelSize: 0,
    setCPanelSize: (cPanelSize) => set({ cPanelSize }),
    cPanelVisible: true,
    setCPanelVisible: (cPanelVisible) => set({ cPanelVisible }),
    toggleCPanelVisibility: () => {
      set((state) => ({
        cPanelVisible: !state.cPanelVisible
      }));
    },
    cPanelContinuousUpdate: true,
    setCPanelContinuousUpdate: (cPanelContinuousUpdate) => {
      if (!get().cPanelVisible) return;
      set({ cPanelContinuousUpdate });
    },
    toggleCPanelContinuousUpdate: () => {
      if (!get().cPanelVisible) return;
      set((state) => ({
        cPanelContinuousUpdate: !state.cPanelContinuousUpdate
      }));
    },
    cPanelStateFake: 0,
    triggerCPaneStateChanged: () => {
      set((state) => ({
        cPanelStateFake: state.cPanelStateFake < 100 ? state.cPanelStateFake + 1 : 0
      }));
    },
    getCPanelCustomParams: () => cPanelCustomParamsStore,
    setOrUpdateCPanelCustomParams: (name, object, prop, control, path) => {
      const _path = [...path];
      let store = cPanelCustomParamsStore;
      while (_path.length) {
        const section = _path.shift();
        if (section) {
          store[section] = store[section] || {};
          store = store[section];
        }
      }
      store[name] = { object, prop, control };
    },
    removeCPanelCustomParams: (name, path) => {
      const _path = [...path];
      let store = cPanelCustomParamsStore;
      const stores = [{ store, parent: null, section: '' }];
      while (_path.length) {
        const section = _path.shift();
        if (section) {
          stores.push({ store: store[section], parent: store, section });
          store = store[section];
        }
      }

      delete store[name];
      while (stores.length) {
        const { store, parent, section } = stores.pop()!;
        if (Object.keys(store).length === 0 && parent) {
          delete parent[section];
        }
      }
    },
    cPanelCustomParamsStructureStateFake: 0,
    triggerCPanelCustomParamsStructureChanged: () => {
      set((state) => ({
        cPanelCustomParamsStructureStateFake:
          state.cPanelCustomParamsStructureStateFake < 100 ? state.cPanelCustomParamsStructureStateFake + 1 : 0
      }));
    },
    loadModelIsOpen: false,
    setLoadModelIsOpen: (loadModelIsOpen) => set({ loadModelIsOpen }),
    cameraControl: cameraControl,
    setCameraControl: (cameraControl) => {
      if (get().isDraggingTransformControls) return;
      set({ cameraControl });
      localStorage.setItem('threeInspector__cameraControl', cameraControl);
    },
    toggleCameraControl: () => {
      if (get().isDraggingTransformControls) return;
      set((state) => ({
        cameraControl: state.cameraControl === 'fly' ? 'orbit' : 'fly'
      }));
      localStorage.setItem('threeInspector__cameraControl', get().cameraControl);
    },
    cameraType: cameraType, // Warning: orthographic camera does not work with CubeTexture for Scene.background
    setCameraType: (cameraType) => {
      if (get().isDraggingTransformControls) return;
      set({ cameraType });
      localStorage.setItem('threeInspector__cameraType', cameraType);
    },
    toggleCameraType: () => {
      if (get().isDraggingTransformControls) return;
      set((state) => ({
        cameraType: state.cameraType === 'perspective' ? 'orthographic' : 'perspective'
      }));
      localStorage.setItem('threeInspector__cameraType', get().cameraType);
    },
    currentCameraStateFake: 0,
    triggerCurrentCameraChanged: () => {
      set((state) => ({
        currentCameraStateFake: state.currentCameraStateFake < 100 ? state.currentCameraStateFake + 1 : 0
      }));
    },
    attachDefaultControllersToPlayingCamera: true,
    setAttachDefaultControllersToPlayingCamera: (attachDefaultControllersToPlayingCamera) =>
      set({ attachDefaultControllersToPlayingCamera }),
    toggleAttachDefaultControllersToPlayingCamera: () =>
      set((state) => ({
        attachDefaultControllersToPlayingCamera: !state.attachDefaultControllersToPlayingCamera
      })),
    selectedObjectUUID: '',
    getSelectedObject: () => selectedObject,
    setSelectedObject: (_selectedObject = null) => {
      selectedObject = _selectedObject;
      set({
        selectedObjectUUID: _selectedObject?.uuid ?? ''
      });
    },
    selectedObjectStateFake: 0,
    triggerSelectedObjectChanged: () =>
      set((state) => ({
        selectedObjectStateFake: state.selectedObjectStateFake < 100 ? state.selectedObjectStateFake + 1 : 0
      })),
    deleteSelectedObject: () => {
      const object = get().getSelectedObject();

      if (!object) return;

      let scene = null;
      let walker: THREE.Object3D | null = object;

      while (walker) {
        if (walker instanceof THREE.Scene) {
          scene = walker;
          break;
        }
        walker = walker.parent;
      }

      if (!scene) return;

      scene.__inspectorData.transformControlsRef?.current?.detach();
      object.removeFromParent();
    }
  }))
  // )
);

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
// import { devtools } from 'zustand/middleware';
// import type {} from '@redux-devtools/extension'; // required for devtools typing
import { BindingParams } from 'tweakpane';
import * as THREE from 'three';
import { setFullScreen } from 'lib/utils';
import { isTextureImage, isValidTexture } from 'src/types';

const cPanelCustomParamsStore: any = {};
let selectedObject: THREE.Object3D | null = null;

export interface AppStore {
  isInjected: boolean;
  setIsInjected: (isInjected: boolean) => void;
  isPlaying: boolean;
  setPlaying: (isPlaying: boolean) => void;
  togglePlaying: () => void;
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
  setOrUpdateCPanelCustomParams: (name: string, customParams: any) => void;
  removeCPanelCustomParams: (name: string) => void;
  cPanelCustomParamsStateFake: number;
  triggerCPanelCustomParamsChanged: () => void;
  cPanelCustomControls: Record<string, BindingParams>;
  setCPanelCustomControls: (name: string, customParams: any) => void;
  removeCPanelCustomControls: (name: string) => void;
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
  setSelectedObject: (object: THREE.Object3D | null) => void;
  selectedObjectStateFake: number;
  triggerSelectedObjectChanged: () => void;
}

export const useAppStore = create<AppStore>()(
  // devtools makes cPanel continuous update (when playing) very slow when displaying materials (hard to serialize). So we're disabling it.
  // devtools(
  subscribeWithSelector((set, get) => ({
    isInjected: false,
    setIsInjected: (isInjected) => set({ isInjected }),
    isPlaying: false,
    setPlaying: (isPlaying) => {
      if (get().isDraggingTransformControls) return;
      set({ isPlaying });
    },
    togglePlaying: () => {
      if (get().isDraggingTransformControls) return;
      set((state) => ({
        isPlaying: !state.isPlaying
      }));
    },
    angleFormat: 'deg',
    setAngleFormat: (angleFormat) => set({ angleFormat }),
    toggleAngleFormat: () =>
      set((state) => ({
        angleFormat: state.angleFormat === 'deg' ? 'rad' : 'deg'
      })),
    shiftKeyPressed: false,
    setShiftKeyPressed: (shiftKeyPressed) => set({ shiftKeyPressed }),
    controlKeyPressed: false,
    setControlKeyPressed: (controlKeyPressed) => set({ controlKeyPressed }),
    isFullscreen:
      // @ts-ignore
      document.fullscreenElement || document.webkitFullscreenElement,
    toggleFullscreen: () =>
      setFullScreen(
        // @ts-ignore
        !(document.fullscreenElement || document.webkitFullscreenElement)
      ),
    transformControlsMode: 'translate',
    setTransformControlsMode: (mode) => set({ transformControlsMode: mode }),
    transformControlsSpace: 'world',
    setTransformControlsSpace: (space) => set({ transformControlsSpace: space }),
    isDraggingTransformControls: false,
    setIsDraggingTransformControls: (isDraggingTransformControls) => set({ isDraggingTransformControls }),
    showGizmos: true,
    setShowGizmos: (showGizmos) => set({ showGizmos, showHelpers: showGizmos }),
    toggleShowGizmos: () => {
      set((state) => ({
        showGizmos: !state.showGizmos,
        showHelpers: !state.showGizmos
      }));
    },
    showHelpers: false,
    setShowHelpers: (showHelpers) => set({ showHelpers }),
    toggleShowHelpers: () => {
      set((state) => ({
        showHelpers: !state.showHelpers
      }));
    },
    cPanelShowHelp: false,
    setCPanelShowHelp: (cPanelShowHelp) => set({ cPanelShowHelp }),
    toggleCPanelShowHelp: () => {
      set((state) => ({
        cPanelShowHelp: !state.cPanelShowHelp
      }));
    },
    cPanelOpacity: 0,
    setCPanelOpacity: (cPanelOpacity) => set({ cPanelOpacity }),
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
    // setOrUpdateCPanelCustomParams does not replace objects but mutates them
    // in order to not make Tweakpane control stale objects.
    setOrUpdateCPanelCustomParams: (name, customParams) => {
      const type = typeof customParams;
      if (
        type === 'string' ||
        type === 'number' ||
        type === 'boolean' ||
        customParams === null ||
        cPanelCustomParamsStore[name] === undefined ||
        cPanelCustomParamsStore[name] === null ||
        isTextureImage(customParams) ||
        isValidTexture(customParams)
      ) {
        cPanelCustomParamsStore[name] = customParams;
      } else {
        Object.assign(cPanelCustomParamsStore[name], customParams);
      }
    },
    removeCPanelCustomParams: (name) => {
      delete cPanelCustomParamsStore[name];
    },
    cPanelCustomParamsStateFake: 0,
    triggerCPanelCustomParamsChanged: () => {
      set((state) => ({
        cPanelCustomParamsStateFake: state.cPanelCustomParamsStateFake < 100 ? state.cPanelCustomParamsStateFake + 1 : 0
      }));
    },
    cPanelCustomControls: {},
    setCPanelCustomControls: (name, customControls) => {
      set((state) => {
        return {
          cPanelCustomControls: {
            ...state.cPanelCustomControls,
            [name]: customControls
          }
        };
      });
    },
    removeCPanelCustomControls: (name) =>
      set((state) => {
        delete state.cPanelCustomControls[name];
        return { cPanelCustomControls: { ...state.cPanelCustomControls } };
      }),
    loadModelIsOpen: false,
    setLoadModelIsOpen: (loadModelIsOpen) => set({ loadModelIsOpen }),
    cameraControl: 'orbit',
    setCameraControl: (cameraControl) => {
      if (get().isDraggingTransformControls) return;
      set({ cameraControl });
    },
    toggleCameraControl: () => {
      if (get().isDraggingTransformControls) return;
      set((state) => ({
        cameraControl: state.cameraControl === 'fly' ? 'orbit' : 'fly'
      }));
    },
    cameraType: 'perspective', // Warning: orthographic camera does not work with CubeTexture for Scene.background
    setCameraType: (cameraType) => {
      if (get().isDraggingTransformControls) return;
      set({ cameraType });
    },
    toggleCameraType: () => {
      if (get().isDraggingTransformControls) return;
      set((state) => ({
        cameraType: state.cameraType === 'perspective' ? 'orthographic' : 'perspective'
      }));
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
    setSelectedObject: (_selectedObject) => {
      selectedObject = _selectedObject;
      set({
        selectedObjectUUID: _selectedObject?.uuid ?? ''
      });
    },
    selectedObjectStateFake: 0,
    triggerSelectedObjectChanged: () =>
      set((state) => ({
        selectedObjectStateFake: state.selectedObjectStateFake < 100 ? state.selectedObjectStateFake + 1 : 0
      }))
  }))
  // )
);

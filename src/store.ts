import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
// import { devtools } from 'zustand/middleware';
// import type {} from '@redux-devtools/extension'; // required for devtools typing
import type { BindingParams } from 'tweakpane';
import * as THREE from 'three';
import { setFullScreen } from 'lib/utils/fullScreenUtils';
import { getProjectPathFromURL } from 'lib/utils/getSetProjectURL';

const cPanelCustomParamsStore: any = {};
let selectedObject: THREE.Object3D | null = null;

const showAxisHelperDefault = true;
const showAxisHelper = localStorage.getItem('threeInspector__showAxesHelper')
  ? localStorage.getItem('threeInspector__showAxesHelper') === 'true'
  : showAxisHelperDefault;

const showGridHelperDefault = true;
const showGridHelper = localStorage.getItem('threeInspector__showGridHelper')
  ? localStorage.getItem('threeInspector__showGridHelper') === 'true'
  : showGridHelperDefault;

const showSceneSizeHelper = false;

const showGizmosDefault = true;
const showGizmos = localStorage.getItem('threeInspector__showGizmos')
  ? localStorage.getItem('threeInspector__showGizmos') === 'true'
  : showGizmosDefault;

const showHelpersDefault = true;
const showHelpers =
  showGizmos && localStorage.getItem('threeInspector__showHelpers')
    ? localStorage.getItem('threeInspector__showHelpers') === 'true'
    : showHelpersDefault;

const gizmoSizeDefault = 0.25;
const gizmoSize = +(localStorage.getItem('threeInspector__gizmoSize') || gizmoSizeDefault);

const angleFormatDefault = 'deg';
const angleFormat = (
  localStorage.getItem('threeInspector__angleFormat')
    ? localStorage.getItem('threeInspector__angleFormat')
    : angleFormatDefault
) as 'deg' | 'rad';

const cameraTypeDefault = 'perspective';
const cameraType = (
  localStorage.getItem('threeInspector__cameraType')
    ? localStorage.getItem('threeInspector__cameraType')
    : cameraTypeDefault
) as 'perspective' | 'orthographic';

const cPanelOpacityDefault = 0;
const cPanelOpacity = localStorage.getItem('threeInspector__cPanelOpacity')
  ? +(localStorage.getItem('threeInspector__cPanelOpacity') || cPanelOpacityDefault)
  : cPanelOpacityDefault;

const cPanelSizeDefault = 0;
const cPanelSize = localStorage.getItem('threeInspector__cPanelSize')
  ? +(localStorage.getItem('threeInspector__cPanelSize') || cPanelSizeDefault)
  : cPanelSizeDefault;

const attachDefaultControllersToPlayingCameraDefault = true;
const attachDefaultControllersToPlayingCamera = localStorage.getItem(
  'threeInspector__attachDefaultControllersToPlayingCamera'
)
  ? localStorage.getItem('threeInspector__attachDefaultControllersToPlayingCamera') === 'true'
  : attachDefaultControllersToPlayingCameraDefault;

const destroyOnRemoveDefault = true;
const destroyOnRemove = localStorage.getItem('threeInspector__destroyOnRemove')
  ? localStorage.getItem('threeInspector__destroyOnRemove') === 'true'
  : destroyOnRemoveDefault;

const positionPointerKeyMultiplierDefault = { x: 1, y: 1 };
const positionPointerKeyMultiplier = localStorage.getItem('threeInspector__positionPointerKeyMultiplier')
  ? JSON.parse(localStorage.getItem('threeInspector__positionPointerKeyMultiplier')!)
  : positionPointerKeyMultiplierDefault;

export const clearLocalStorage = () => {
  localStorage.removeItem('threeInspector__showAxesHelper');
  localStorage.removeItem('threeInspector__showGridHelper');
  localStorage.removeItem('threeInspector__showGizmos');
  localStorage.removeItem('threeInspector__showHelpers');
  localStorage.removeItem('threeInspector__angleFormat');
  localStorage.removeItem('threeInspector__cameraType');
  localStorage.removeItem('threeInspector__cPanelOpacity');
  localStorage.removeItem('threeInspector__cPanelSize');
  localStorage.removeItem('threeInspector__attachDefaultControllersToPlayingCamera');
  localStorage.removeItem('threeInspector__destroyOnRemove');
  localStorage.removeItem('threeInspector__positionPointerKeyMultiplier');
};

export interface AppStore {
  reset: () => void;
  currentProjectPath: string | null;
  projects: { path: string; name: string }[];
  setProjects: (projects: AppStore['projects']) => void;
  setCurrentProjectPath: (project: AppStore['currentProjectPath']) => void;
  currentExperience: string | null;
  experiences: NonNullable<AppStore['currentExperience']>[];
  setExperiences: (experiences: AppStore['experiences']) => void;
  setCurrentExperience: (experience: AppStore['currentExperience']) => void;
  isInjected: boolean;
  setIsInjected: (isInjected: boolean) => void;
  outlinerSearch: string;
  setOutlinerSearch: (outlinerSearch: string) => void;
  autoNavControls: 'never' | 'always' | 'whenStopped';
  setAutoNavControls: (autoNavControls: AppStore['autoNavControls']) => void;
  playingState: 'stopped' | 'playing' | 'paused';
  setPlayingState: (playingState: AppStore['playingState']) => void;
  getPlayingState: () => AppStore['playingState'];
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
  useTransformControls: boolean;
  setUseTransformControls: (useTransformControls: boolean) => void;
  isDraggingTransformControls: boolean;
  setIsDraggingTransformControls: (isDraggingTransformControls: boolean) => void;
  getIsDraggingTransformControls: () => boolean;
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
  showSceneSizeHelper: boolean;
  toggleShowSceneSizeHelper: () => void;
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
  triggerCPanelStateChanged: () => void;
  getCPanelCustomParams: () => typeof cPanelCustomParamsStore;
  clearCPanelCustomParams: () => void;
  setOrUpdateCPanelCustomParams: (
    name: string,
    object: any,
    prop: string | undefined,
    control: BindingParams,
    path: string[]
  ) => void;
  removeCPanelCustomParams: (name: string, path: string[]) => void;
  cPanelCustomParamsStructureStateFake: number;
  loadObjectIsOpen: boolean;
  setLoadObjectIsOpen: (isOpen: boolean) => void;
  materialEditIsOpen: boolean;
  setMaterialEditIsOpen: (isOpen: boolean) => void;
  cameraType: 'perspective' | 'orthographic';
  setCameraType: (type: 'perspective' | 'orthographic') => void;
  toggleCameraType: () => void;
  currentCameraStateFake: number;
  triggerCurrentCameraChanged: () => void;
  currentSceneStateFake: number;
  triggerCurrentSceneChanged: () => void;
  attachDefaultControllersToPlayingCamera: boolean;
  setAttachDefaultControllersToPlayingCamera: (attachDefaultControllersToPlayingCamera: boolean) => void;
  toggleAttachDefaultControllersToPlayingCamera: () => void;
  selectedObjectUUID: string;
  getSelectedObject: () => THREE.Object3D | null;
  setSelectedObject: (object?: THREE.Object3D | null) => void;
  selectedObjectStateFake: number;
  triggerSelectedObjectChanged: () => void;
  deleteSelectedObject: () => void;
  destroyOnRemove: boolean;
  setDestroyOnRemove: (destroyOnRemove: boolean) => void;
  toggleDestroyOnRemove: () => void;
  positionPointerKeyMultiplier: { x: number; y: number };
  setPositionPointerKeyMultiplier: (positionPointerKeyMultiplier: { x: number; y: number }) => void;
}

export const useAppStore = create<AppStore>()(
  // devtools makes cPanel continuous update (when playing) very slow when displaying materials (hard to serialize). So we're disabling it.
  // devtools(
  subscribeWithSelector((set, get) => ({
    reset: () => {
      clearLocalStorage();
      get().setSelectedObject(null);
      set({
        currentExperience: null,
        experiences: [],
        isInjected: true,
        outlinerSearch: '',
        autoNavControls: 'never',
        playingState: 'stopped',
        angleFormat: angleFormatDefault,
        shiftKeyPressed: false,
        controlKeyPressed: false,
        isFullscreen:
          // @ts-ignore
          document.fullscreenElement || document.webkitFullscreenElement,
        useTransformControls: true,
        transformControlsMode: 'translate',
        transformControlsSpace: 'world',
        isDraggingTransformControls: false,
        showGizmos: showGizmosDefault,
        showHelpers: showHelpersDefault,
        gizmoSize: gizmoSizeDefault,
        showAxesHelper: showAxisHelperDefault,
        showGridHelper: showGridHelperDefault,
        showSceneSizeHelper,
        cPanelShowHelp: false,
        cPanelOpacity: cPanelOpacityDefault,
        cPanelSize: cPanelSizeDefault,
        cPanelVisible: true,
        cPanelContinuousUpdate: true,
        cPanelStateFake: 0,
        cPanelCustomParamsStructureStateFake: 0,
        loadObjectIsOpen: false,
        cameraType: cameraTypeDefault,
        currentCameraStateFake: 0,
        currentSceneStateFake: 0,
        attachDefaultControllersToPlayingCamera: attachDefaultControllersToPlayingCameraDefault,
        selectedObjectUUID: '',
        selectedObjectStateFake: 0,
        destroyOnRemove: destroyOnRemoveDefault
      });
    },
    currentProjectPath: null,
    projects: [],
    setProjects: (projects) => {
      set({ projects });
      const currentProjectPath = getProjectPathFromURL(projects);
      set({ currentProjectPath });
    },
    setCurrentProjectPath: (currentProjectPath) => {
      set({ currentProjectPath });
    },
    currentExperience: null,
    experiences: [],
    setExperiences: (experiences) => {
      set({ experiences });
    },
    setCurrentExperience: (currentExperience) => {
      set({ currentExperience });
    },
    isInjected: true,
    setIsInjected: (isInjected) => set({ isInjected }),
    outlinerSearch: '',
    setOutlinerSearch: (outlinerSearch) => set({ outlinerSearch }),
    autoNavControls: 'never',
    setAutoNavControls: (autoNavControls) => set({ autoNavControls }),
    playingState: 'stopped',
    setPlayingState: (playingState) => {
      if (get().isDraggingTransformControls) return;
      set({ playingState });
    },
    getPlayingState: () => get().playingState,
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
    useTransformControls: true,
    setUseTransformControls: (useTransformControls) => {
      set({ useTransformControls });
    },
    transformControlsMode: 'translate',
    setTransformControlsMode: (mode) => set({ transformControlsMode: mode }),
    transformControlsSpace: 'world',
    setTransformControlsSpace: (space) => set({ transformControlsSpace: space }),
    isDraggingTransformControls: false,
    setIsDraggingTransformControls: (isDraggingTransformControls) => set({ isDraggingTransformControls }),
    getIsDraggingTransformControls: () => get().isDraggingTransformControls,
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
    gizmoSize: gizmoSize,
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
    showSceneSizeHelper: showSceneSizeHelper,
    toggleShowSceneSizeHelper: () => {
      set((state) => ({
        showSceneSizeHelper: !state.showSceneSizeHelper
      }));
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
    cPanelSize: cPanelSize,
    setCPanelSize: (cPanelSize) => {
      set({ cPanelSize });
      localStorage.setItem('threeInspector__cPanelSize', cPanelSize.toString());
    },
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
    // called when CPanel needs to get rebuilt (e.g. when a texture has been changed)
    // should not be called to often because all CPanel tabs get rebuilt
    // currently called
    // - from loadTexture#createTexturesFromImages
    triggerCPanelStateChanged: () => {
      set((state) => ({
        cPanelStateFake: state.cPanelStateFake < 100 ? state.cPanelStateFake + 1 : 0
      }));
    },
    getCPanelCustomParams: () => cPanelCustomParamsStore,
    clearCPanelCustomParams: () => {
      Object.keys(cPanelCustomParamsStore).forEach((key) => {
        delete cPanelCustomParamsStore[key];
      });
    },
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
      set((state) => ({
        cPanelCustomParamsStructureStateFake:
          state.cPanelCustomParamsStructureStateFake < 100 ? state.cPanelCustomParamsStructureStateFake + 1 : 0
      }));
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
      set((state) => ({
        cPanelCustomParamsStructureStateFake:
          state.cPanelCustomParamsStructureStateFake < 100 ? state.cPanelCustomParamsStructureStateFake + 1 : 0
      }));
    },
    cPanelCustomParamsStructureStateFake: 0,
    loadObjectIsOpen: false,
    setLoadObjectIsOpen: (loadObjectIsOpen) => set({ loadObjectIsOpen }),
    materialEditIsOpen: false,
    setMaterialEditIsOpen: (materialEditIsOpen) => set({ materialEditIsOpen }),
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
    // called
    //  - from SetUp when camera changed
    triggerCurrentCameraChanged: () => {
      set((state) => ({
        currentCameraStateFake: state.currentCameraStateFake < 100 ? state.currentCameraStateFake + 1 : 0
      }));
    },
    currentSceneStateFake: 0,
    // called
    //  - from SetUp when scene changed
    triggerCurrentSceneChanged: () => {
      set((state) => ({
        currentSceneStateFake: state.currentSceneStateFake < 100 ? state.currentSceneStateFake + 1 : 0
      }));
    },
    attachDefaultControllersToPlayingCamera: attachDefaultControllersToPlayingCamera,
    setAttachDefaultControllersToPlayingCamera: (attachDefaultControllersToPlayingCamera) => {
      set({ attachDefaultControllersToPlayingCamera });
      localStorage.setItem(
        'threeInspector__attachDefaultControllersToPlayingCamera',
        attachDefaultControllersToPlayingCamera.toString()
      );
    },
    toggleAttachDefaultControllersToPlayingCamera: () => {
      set((state) => ({
        attachDefaultControllersToPlayingCamera: !state.attachDefaultControllersToPlayingCamera
      }));
      localStorage.setItem(
        'threeInspector__attachDefaultControllersToPlayingCamera',
        get().attachDefaultControllersToPlayingCamera.toString()
      );
    },
    selectedObjectUUID: '',
    getSelectedObject: () => selectedObject,
    setSelectedObject: (_selectedObject = null) => {
      selectedObject = _selectedObject;
      set({
        selectedObjectUUID: _selectedObject?.uuid ?? ''
      });
    },
    // TODO: seems it is not used anymore, thus triggerSelectedObjectChanged can be removed.
    // It was used in patchThree to update helpers when selected object changed.
    selectedObjectStateFake: 0,
    // called
    //  - from CPanel when any prop of selected object changed
    //  - from SetUp when TransformControls changed
    triggerSelectedObjectChanged: () =>
      set((state) => ({
        selectedObjectStateFake: state.selectedObjectStateFake < 100 ? state.selectedObjectStateFake + 1 : 0
      })),
    deleteSelectedObject: () => {
      const object = get().getSelectedObject();
      const destroyOnRemove = get().destroyOnRemove;

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

      object.removeFromParent();
      if (destroyOnRemove) {
        object.destroy();
      }
    },
    destroyOnRemove: destroyOnRemove,
    setDestroyOnRemove: (destroyOnRemove) => {
      set({ destroyOnRemove });
      localStorage.setItem('threeInspector__destroyOnRemove', destroyOnRemove.toString());
    },
    toggleDestroyOnRemove: () => {
      set((state) => ({ destroyOnRemove: !state.destroyOnRemove }));
      localStorage.setItem('threeInspector__destroyOnRemove', get().destroyOnRemove.toString());
    },
    positionPointerKeyMultiplier,
    setPositionPointerKeyMultiplier: (positionPointerKeyMultiplier) => {
      set({ positionPointerKeyMultiplier });
      localStorage.setItem(
        'threeInspector__positionPointerKeyMultiplier',
        JSON.stringify(positionPointerKeyMultiplier)
      );
    }
  }))
  // )
);

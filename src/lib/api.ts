import * as THREE from 'three';
import patchThree from './patchThree';
import { deepTraverse, cloneObject3D } from './utils/objectUtils';
import { deepClean } from './utils/cleanUp';
import { createTexturesFromImages } from './utils/loadTexture';
import { injectStats } from './utils/injectStats';
import { loadObject } from './utils/loadObject';
import { splitMeshesByMaterial } from './utils/optimiseModel';
import { useAppStore, type AppStore } from 'src/store';
import { registerDefaultPlayTriggers } from './utils/registerDefaultPlayTriggers';
import { getMaterialFromType } from 'lib/utils/materialUtils';

export default {
  getThreeRootState: patchThree.getThreeRootState,
  getCurrentScene: patchThree.getCurrentScene,
  setCurrentScene: patchThree.setCurrentScene,
  clearScene: patchThree.clearScene,
  getCurrentRenderer: patchThree.getCurrentRenderer,
  setCurrentRenderer: patchThree.setCurrentRenderer,
  refreshCPanel: patchThree.refreshCPanel,
  updateCubeCamera: patchThree.updateCubeCamera,
  updateCubeCameras: patchThree.updateCubeCameras,
  updateSceneBBox: patchThree.updateSceneBBox,
  getShouldUpdateSceneBBoxOnRemoval: patchThree.getShouldUpdateSceneBBoxOnRemoval,
  setShouldUpdateSceneBBoxOnRemoval: patchThree.setShouldUpdateSceneBBoxOnRemoval,
  getSceneSizeV3: patchThree.getSceneSizeV3(),
  getSceneSize: patchThree.getSceneSize(),
  getSceneBBox: patchThree.getSceneBBox(),

  injectStats,

  setProjects: useAppStore.getState().setProjects,
  setShowAxesHelper: useAppStore.getState().setShowAxesHelper,
  setShowGridHelper: useAppStore.getState().setShowGridHelper,
  setShowGizmos: useAppStore.getState().setShowGizmos,

  /**
   * Sets default camera type (when in app  mode - not injected)
   */
  setCameraType: useAppStore.getState().setCameraType,
  /**
   * gets current camera registered with patchThree.
   * This is not updated synchronously when setCameraType is called.
   */
  getCurrentCamera: patchThree.getCurrentCamera,
  getDefaultPerspectiveCamera() {
    return patchThree.defaultPerspectiveCamera;
  },
  getDefaultOrthographicCamera() {
    return patchThree.defaultOrthographicCamera;
  },
  isDefaultPerspectiveCamera(camera: THREE.PerspectiveCamera | THREE.OrthographicCamera) {
    return patchThree.defaultPerspectiveCamera === camera;
  },
  isDefaultOrthographicCamera(camera: THREE.PerspectiveCamera | THREE.OrthographicCamera) {
    return patchThree.defaultOrthographicCamera === camera;
  },

  /**
   * setPlayingState/getPlayingState work in conjunction with usePlay hook
   */
  setPlayingState: useAppStore.getState().setPlayingState,
  getPlayingState: useAppStore.getState().getPlayingState,

  /**
   * Registers default play triggers for the application.
   * This function listens for keydown events on the window
   * and toggles the playing state
   * between 'playing' and 'paused' when the space key is pressed,
   * and sets the playing state to 'stopped' when the backspace key is pressed.
   * It works in conjunction with usePlay hook.
   */
  registerDefaultPlayTriggers,

  cloneObject3D,
  deepTraverse,
  deepClean,

  getMaterialFromType,

  createTexturesFromImages,
  loadObject,
  splitMeshesByMaterial
};

export type { AppStore };

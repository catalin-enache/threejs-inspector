import patchThree from './patchThree';
import { deepTraverse, cloneObject3D } from './utils/objectUtils';
import { deepClean } from './utils/cleanUp';
import { createTexturesFromImages } from './utils/loadTexture';
import { loadModel } from './utils/loadModel';
import { splitMeshesByMaterial } from './utils/optimiseModel';

export default {
  getThreeRootState: patchThree.getThreeRootState,
  getCurrentScene: patchThree.getCurrentScene,
  setCurrentScene: patchThree.setCurrentScene,
  clearScene: patchThree.clearScene,
  getCurrentRenderer: patchThree.getCurrentRenderer,
  setCurrentRenderer: patchThree.setCurrentRenderer,
  attachTransformControls: patchThree.attachTransformControls,
  detachTransformControls: patchThree.detachTransformControls,
  refreshCPanel: patchThree.refreshCPanel,
  updateCubeCameras: patchThree.updateCubeCameras,

  cloneObject3D,
  deepTraverse,
  deepClean,

  createTexturesFromImages,
  loadModel,
  splitMeshesByMaterial
};

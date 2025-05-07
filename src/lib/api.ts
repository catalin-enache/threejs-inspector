import patchThree from './patchThree';
import { deepTraverse, cloneObject3D } from './utils/objectUtils';
import { deepClean } from './utils/cleanUp';
import { createTexturesFromImages } from './utils/loadTexture';
import { loadObject } from './utils/loadObject';
import { splitMeshesByMaterial } from './utils/optimiseModel';

export default {
  getThreeRootState: patchThree.getThreeRootState,
  getCurrentScene: patchThree.getCurrentScene,
  setCurrentScene: patchThree.setCurrentScene,
  clearScene: patchThree.clearScene,
  getCurrentRenderer: patchThree.getCurrentRenderer,
  setCurrentRenderer: patchThree.setCurrentRenderer,
  refreshCPanel: patchThree.refreshCPanel,
  updateCubeCameras: patchThree.updateCubeCameras,
  getShouldUpdateSceneBBoxOnRemoval: patchThree.getShouldUpdateSceneBBoxOnRemoval,
  setShouldUpdateSceneBBoxOnRemoval: patchThree.setShouldUpdateSceneBBoxOnRemoval,

  cloneObject3D,
  deepTraverse,
  deepClean,

  createTexturesFromImages,
  loadObject,
  splitMeshesByMaterial
};

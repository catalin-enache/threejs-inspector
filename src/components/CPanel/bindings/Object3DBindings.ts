import * as THREE from 'three';
import type { CommonGetterParams, onChange } from './bindingTypes';
import { numberCommon } from './bindingHelpers';
import { radToDegFormatter } from 'lib/utils/mathUtils';
import { MaterialBindings } from './MaterialBindings';
import { useAppStore } from 'src/store';
import { exportObject, ExportableTypes } from 'lib/utils/downloadUtils';

export const Object3DBindings = (params: CommonGetterParams) => ({
  id: {
    label: 'ID',
    disabled: true,
    format: (value: number) => value.toFixed(0)
  },
  uuid: {
    label: 'UUID',
    view: 'text',
    disabled: true
  },
  name: {
    label: 'Name',
    view: 'text',
    disabled: true
  },
  type: {
    label: 'Type',
    view: 'text',
    disabled: true
  },
  removeModel: {
    label: 'Remove',
    title: 'Remove',
    onClick: (() => {
      useAppStore.getState().deleteSelectedObject();
      // interactable objects should be cleaned up already
    }) as onChange,
    if: (object: THREE.Object3D) => !!object.parent
  },
  download: {
    label: 'Download',
    title: 'Download',
    onClick: (async ({ object }) => {
      await exportObject(object, { type: 'json' });
    }) as onChange,
    if: (object: THREE.Object3D) => !!object.parent && ExportableTypes.has(object.type)
  },
  position: {
    label: 'Position(L)',
    ...numberCommon
    // if: (object: THREE.Object3D) => !isSkinnedMesh(object)
  },
  rotation: {
    label: `Rotation(${params.angleFormat})(L)`,
    ...numberCommon,
    ...(params.angleFormat === 'deg' ? { format: radToDegFormatter } : {})
    // if: (object: THREE.Object3D) => !isSkinnedMesh(object)
  },
  // quaternion is not displayed because it interferes with rotation when cPanel updates
  // TODO: make a text plugin that only reads
  // quaternion: {
  //   label: `Quaternion(${angleFormat})(L)`,
  //   ...numberCommon,
  //   ...(angleFormat === 'deg' ? { format: radToDegFormatter } : {})
  //   disabled: true
  // },
  scale: {
    label: 'Scale(L)',
    ...numberCommon
    // if: (object: THREE.Object3D) => !isSkinnedMesh(object)
  },
  up: {
    label: 'Up',
    ...numberCommon
    // if: (object: THREE.Object3D) => !isSkinnedMesh(object)
  },
  castShadow: {
    label: 'Cast Shadow',
    view: 'toggle'
  },
  receiveShadow: {
    label: 'Receive Shadow',
    view: 'toggle'
  },
  visible: {
    label: 'Visible',
    view: 'toggle'
  },
  material: {
    // for Mesh
    title: 'Material',
    ...MaterialBindings(params)
  }
});

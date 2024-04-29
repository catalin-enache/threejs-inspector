import type { CommonGetterParams } from './bindingTypes';
import { numberCommon } from './bindingHelpers';
import { radToDegFormatter } from 'lib/utils';
import { MaterialBindings } from 'lib/App/CPanel/bindings/MaterialBindings';

export const Object3DBindings = (params: CommonGetterParams) => ({
  id: {
    label: 'ID',
    disabled: true
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
  parent: {
    // for Object3D
    title: 'Parent',
    id: {
      label: 'ID',
      view: 'text',
      disabled: true
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
    }
  },
  position: {
    label: 'Position(L)',
    ...numberCommon
  },
  rotation: {
    label: `Rotation(${params.angleFormat})(L)`,
    ...numberCommon,
    ...(params.angleFormat === 'deg' ? { format: radToDegFormatter } : {})
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
  },
  up: {
    label: 'Up',
    ...numberCommon
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

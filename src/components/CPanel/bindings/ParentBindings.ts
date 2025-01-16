import type { CommonGetterParams } from './bindingTypes';

export const ParentBindings = (_params: CommonGetterParams) => ({
  parent: {
    // for Object3D
    id: {
      label: 'ID',
      view: 'text',
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
    }
  }
});

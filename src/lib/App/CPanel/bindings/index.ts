import { numberCommon } from './bindingHelpers';
import { MaterialBindings } from './MaterialBindings';
import { Object3DBindings } from './Object3DBindings';
import { ObjectStoreBindings } from './ObjectStoreBindings';
import { LightBindings } from './LightBindings';
import { LightShadowBindings } from './LightShadowBindings';
import { CameraBindings } from './CameraBindings';
import { CameraStoreBindings } from './CameraStoreBindings';
import { SceneButtons } from './SceneButtons';
import {
  RendererBindings,
  RendererInfoRenderBindings,
  RendererInfoMemoryBindings,
  RendererShadowMapBindings
} from './RendererBindings';
import { PaneBindings } from './PaneBindings';
import { SceneConfigBindings } from './SceneConfigBindings';
import { RaycasterParamsLineBindings, RaycasterParamsPointsBindings } from './RaycasterBindings';
import type { CommonGetterParams } from './bindingTypes';

export const getObjectsStoreBindings = (params: CommonGetterParams) => ({
  ...ObjectStoreBindings(params)
});

export const getObject3DBindings = (params: CommonGetterParams) => ({
  ...Object3DBindings(params),
  ...CameraBindings(params),
  ...LightBindings(params),
  shadow: {
    // Some lights have shadow
    title: 'Shadow',
    ...LightShadowBindings(params),
    camera: {
      title: 'Camera',
      ...CameraBindings(params)
    }
  },
  target: {
    // for DirectionalLight, SpotLight
    title: 'Target',
    position: {
      label: 'Position',
      ...numberCommon
    }
  },
  material: {
    // for Mesh
    title: 'Material',
    ...MaterialBindings(params)
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
  }
});

export const getRendererBindings = (params: CommonGetterParams) => ({
  ...RendererBindings(params),
  shadowMap: {
    title: 'Shadow Map',
    ...RendererShadowMapBindings(params)
  },
  info: {
    title: 'Info',
    memory: {
      title: 'Memory (Geometries,Textures)',
      ...RendererInfoMemoryBindings(params)
    },
    render: {
      title: 'Render (Calls,Tris,Pnts,Lns,Frm)',
      ...RendererInfoRenderBindings(params)
    }
  }
});

export const getPaneBindings = (params: CommonGetterParams) => ({
  ...PaneBindings(params)
});

export const getCameraStoreBindings = (params: CommonGetterParams) => ({
  ...CameraStoreBindings(params)
});

export const getSceneButtons = (params: CommonGetterParams) => ({ ...SceneButtons(params) });

export const getSceneConfigBindings = (params: CommonGetterParams) => ({
  ...SceneConfigBindings(params)
});

export const getRaycasterParamsBindings = (params: CommonGetterParams) => ({
  params: {
    title: 'Params',
    Line: {
      title: 'Line',
      ...RaycasterParamsLineBindings(params)
    },
    Points: {
      title: 'Points',
      ...RaycasterParamsPointsBindings(params)
    }
  }
});

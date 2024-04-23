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

export const getObjectsStoreBindings = () => ({
  ...ObjectStoreBindings()
});

export const getObject3DBindings = (params: CommonGetterParams) => ({
  ...Object3DBindings(params),
  ...CameraBindings(),
  ...LightBindings(),
  shadow: {
    // Some lights have shadow
    title: 'Shadow',
    ...LightShadowBindings(),
    camera: {
      title: 'Camera',
      ...CameraBindings()
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

export const getRendererBindings = () => ({
  ...RendererBindings(),
  shadowMap: {
    title: 'Shadow Map',
    ...RendererShadowMapBindings()
  },
  info: {
    title: 'Info',
    memory: {
      title: 'Memory (Geometries,Textures)',
      ...RendererInfoMemoryBindings()
    },
    render: {
      title: 'Render (Calls,Tris,Pnts,Lns,Frm)',
      ...RendererInfoRenderBindings()
    }
  }
});

export const getPaneBindings = () => ({
  ...PaneBindings()
});

export const getCameraStoreBindings = () => ({
  ...CameraStoreBindings()
});

export const getSceneButtons = ({ isPlaying }: CommonGetterParams) => [...SceneButtons({ isPlaying })];

export const getSceneConfigBindings = ({ angleFormat }: CommonGetterParams) => ({
  ...SceneConfigBindings({ angleFormat })
});

export const getRaycasterParamsBindings = () => ({
  params: {
    title: 'Params',
    Line: {
      title: 'Line',
      ...RaycasterParamsLineBindings()
    },
    Points: {
      title: 'Points',
      ...RaycasterParamsPointsBindings()
    }
  }
});

import type { onChange, CommonGetterParams } from './bindingTypes';
import { TextureBindings } from './TextureBindings';
import { RenderTargetBindings } from './RenderTargetBindings';
import { CameraBindings } from './CameraBindings';

export const LightShadowBindings = (params: CommonGetterParams) => ({
  map: {
    title: 'Map',
    texture: {
      label: 'Texture',
      gl: params.sceneObjects.gl,
      isShadowMap: true,
      details: {
        ...TextureBindings(params)
      }
    },
    ...RenderTargetBindings(params)
  },
  // this seems to be null
  mapPass: {
    title: 'Map Pass',
    texture: {
      label: 'Texture',
      gl: params.sceneObjects.gl,
      // isShadowMap: true,
      details: {
        ...TextureBindings(params)
      }
    },
    ...RenderTargetBindings(params)
  },
  mapSize: {
    label: 'MapSize',
    step: 1,
    onChange: (({ bindings }) => {
      if (bindings.__parentObject?.shadow?.map) {
        bindings.__parentObject.shadow.map.dispose();
        bindings.__parentObject.shadow.map = null;
      }
    }) as onChange
  },
  intensity: {
    label: 'Intensity',
    min: 0,
    max: 1
  },
  radius: {
    label: 'Radius',
    min: 0
  },
  blurSamples: {
    label: 'Blur Samples',
    step: 1,
    min: 0
  },
  bias: {
    label: 'Bias',
    step: 0.0001
  },
  normalBias: {
    label: 'Normal bias',
    step: 1
  },
  camera: {
    title: 'Camera',
    ...CameraBindings(params)
  }
});

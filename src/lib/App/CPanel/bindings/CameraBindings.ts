import { numberCommon } from './bindingHelpers';
import type { CommonGetterParams, init, onChange } from './bindingTypes';
import * as THREE from 'three';
import { CubeRenderTargetBindings } from './CubeRenderTargetBindings';
import { TextureBindings } from './TextureBindings';

export const PerspectiveCameraBindings = (_params: CommonGetterParams) => ({
  aspect: {
    label: 'Aspect',
    ...numberCommon
  },
  fov: {
    label: 'FOV',
    ...numberCommon
  },
  filmGauge: {
    label: 'Film Gauge',
    ...numberCommon
  },
  filmOffset: {
    label: 'Film Offset',
    ...numberCommon
  }
});

export const OrthographicCameraBindings = (_params: CommonGetterParams) => ({
  left: {
    label: 'Left',
    ...numberCommon
  },
  right: {
    label: 'Right',
    ...numberCommon
  },
  top: {
    label: 'Top',
    ...numberCommon
  },
  bottom: {
    label: 'Bottom',
    ...numberCommon
  }
});

export const CubeCameraBindings = (params: CommonGetterParams) => ({
  renderTarget: {
    title: 'Render Target',
    texture: {
      label: 'Texture',
      gl: params.sceneObjects.gl,
      disabled: true, // disallow overriding - no use for it
      cubeTextureRenderLayout: 'cross', // cross | equirectangular
      canvasWidth: 4096, // using high resolution to facilitate download and reuse as scene bg
      init(this: any, { object }: Parameters<init>[0]) {
        this.renderTarget = object;
      },
      details: {
        ...TextureBindings(params)
      }
    },
    ...CubeRenderTargetBindings(params)
  }
});

export const CameraBindings = (params: CommonGetterParams) => {
  const cameraBindings = {
    near: {
      label: 'Near',
      ...numberCommon,
      min: 0
    },
    far: {
      label: 'Far',
      ...numberCommon
    },
    zoom: {
      label: 'Zoom',
      ...numberCommon,
      min: 0
    },
    ...PerspectiveCameraBindings(params),
    ...OrthographicCameraBindings(params),
    ...CubeCameraBindings(params)
  };
  Object.keys(cameraBindings).forEach((key) => {
    // @ts-ignore
    const binding = cameraBindings[key];
    const existingOnChange = binding.onChange;
    binding.onChange = (({ object, bindings, folder }) => {
      existingOnChange?.({ object, bindings, folder });
      if (object instanceof THREE.PerspectiveCamera || object instanceof THREE.OrthographicCamera) {
        object.updateProjectionMatrix();
      }
    }) as onChange;
  });
  return cameraBindings;
};

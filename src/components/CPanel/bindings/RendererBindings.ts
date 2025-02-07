import * as THREE from 'three';
import type { onChange, CommonGetterParams } from './bindingTypes';

export const RendererInfoMemoryBindings = (_params: CommonGetterParams) => ({
  geometries: {
    label: 'Geometries',
    disabled: true
  },
  textures: {
    label: 'Textures',
    disabled: true
  }
});

export const RendererInfoRenderBindings = (_params: CommonGetterParams) => ({
  calls: {
    label: 'Calls',
    disabled: true
  },
  triangles: {
    label: 'Triangles',
    disabled: true
  },
  points: {
    label: 'Points',
    disabled: true
  },
  lines: {
    label: 'Lines',
    disabled: true
  },
  frame: {
    label: 'Frame',
    disabled: true
  }
});

export const RendererBindings = (_params: CommonGetterParams) => ({
  toneMapping: {
    label: 'Tone Mapping',
    options: {
      None: THREE.NoToneMapping,
      Linear: THREE.LinearToneMapping,
      Reinhard: THREE.ReinhardToneMapping,
      Cineon: THREE.CineonToneMapping,
      ACESFilmic: THREE.ACESFilmicToneMapping,
      AGX: THREE.AgXToneMapping,
      Neutral: THREE.NeutralToneMapping,
      Custom: THREE.CustomToneMapping
    }
  },
  toneMappingExposure: {
    label: 'Tone Mapping Exposure',
    step: 0.01
  },
  outputColorSpace: {
    label: 'Output Color Space',
    options: {
      // NoColorSpace: THREE.NoColorSpace,
      SRGBColorSpace: THREE.SRGBColorSpace,
      LinearSRGBColorSpace: THREE.LinearSRGBColorSpace
    }
  },
  transmissionResolutionScale: {
    label: 'Transmission Resolution Scale',
    step: 0.01
  },
  localClippingEnabled: {
    label: 'Local Clipping Enabled'
  },
  sortObjects: {
    label: 'Sort Objects'
  },
  coordinateSystem: {
    label: 'Coordinate System',
    options: {
      WebGLCoordinateSystem: THREE.WebGLCoordinateSystem,
      WebGPUCoordinateSystem: THREE.WebGPUCoordinateSystem
    },
    disabled: true
  }
});

export const RendererShadowMapBindings = ({ sceneObjects: { scene } }: CommonGetterParams) => ({
  type: {
    label: 'Type',
    options: {
      Basic: THREE.BasicShadowMap,
      Percentage: THREE.PCFShadowMap,
      Soft: THREE.PCFSoftShadowMap,
      Variance: THREE.VSMShadowMap
    },
    onChange: (() => {
      scene.traverse((child: any) => {
        if (child instanceof THREE.Mesh && child.material) child.material.needsUpdate = true;
      });
    }) as onChange
  }
});

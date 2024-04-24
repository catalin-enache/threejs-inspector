import * as THREE from 'three';
import type { onChange } from './bindingTypes';

export const RendererInfoMemoryBindings = () => ({
  geometries: {
    label: 'Geometries',
    disabled: true
  },
  textures: {
    label: 'Textures',
    disabled: true
  }
});

export const RendererInfoRenderBindings = () => ({
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

export const RendererBindings = () => ({
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
  }
});

export const RendererShadowMapBindings = () => ({
  type: {
    label: 'Type',
    options: {
      Basic: THREE.BasicShadowMap,
      Percentage: THREE.PCFShadowMap,
      Soft: THREE.PCFSoftShadowMap,
      Variance: THREE.VSMShadowMap
    },
    onChange: (({ object }) => {
      const scene = object.__sceneObjects.scene;
      scene.traverse((child: any) => {
        if (child instanceof THREE.Mesh && child.material) child.material.needsUpdate = true;
      });
    }) as onChange
  }
});

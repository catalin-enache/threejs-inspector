import { BaseInputParams, BindingTarget, createPlugin, InputBindingPlugin } from '@tweakpane/core';
import * as THREE from 'three';
import { TextureController } from './controller';
import { isValidTexture } from 'src/types';

const DEFAULT_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.tif',
  '.tiff',
  '.exr',
  '.hdr',
  '.tga',
  '.ktx2',
  '.dds',
  // .pvr can be single image or 6x1 cube texture.
  // If 6x1 cube texture, it is only valid as envMap or bumpMap as observed so far
  '.pvr'
];

type TexturePluginConfigKeys = 'gl' | 'isShadowMap' | 'renderTarget' | 'extensions';

export interface TexturePluginConfig extends BaseInputParams {
  gl: THREE.WebGLRenderer;
  extensions?: string[];
  isShadowMap?: boolean; // for lights
  renderTarget?: THREE.WebGLRenderTarget | THREE.WebGLCubeRenderTarget; // for CubeCamera
  extractOneTextureAtIndex?: number; // for CubeCamera, if specified just one texture from 6 will get rendered, else it will extract all 6 using cubeTextureRenderLayout
  cubeTextureRenderLayout?: 'cross' | 'equirectangular'; // for CubeCamera
  canvasWidth?: number;
}

let debugID = 1;

export const TextureBindingPlugin: InputBindingPlugin<THREE.Texture, THREE.Texture, TexturePluginConfig> = createPlugin(
  {
    // api: {},
    id: 'TexturePlugin',
    type: 'input',
    accept: (exValue: unknown, params: Record<TexturePluginConfigKeys, any>) => {
      if (!isValidTexture(exValue)) {
        return null;
      }

      // gl is required
      if (!(params.gl instanceof THREE.WebGLRenderer)) {
        return null;
      }

      return {
        initialValue: exValue,
        params: params
      };
    },

    binding: {
      reader: (_args) => {
        // @ts-ignore
        // eslint-disable-next-line
        const id = ++debugID;
        let lastValue: any = null;
        return (value: unknown): THREE.Texture => {
          if (lastValue !== value) {
            // prettier-ignore
            // console.log('TextureBindingPlugin.binding.reader', { label: _args.params.label, id, _args, value });
            lastValue = value;
          }
          return value as THREE.Texture;
        };
      },
      writer: (_args) => (target: BindingTarget, inValue: THREE.Texture) => {
        // prettier-ignore
        // console.log('TextureBindingPlugin.binding.writer', { inValue, id: debugID });
        target.write(inValue);
      }
    },

    controller(args) {
      // console.log('TextureBindingPlugin.controller()', { args });
      return new TextureController(args.document, {
        value: args.value,
        extensions: args.params.extensions ?? DEFAULT_EXTENSIONS,
        gl: args.params.gl!,
        isShadowMap: !!args.params.isShadowMap,
        renderTarget: args.params.renderTarget,
        viewProps: args.viewProps,
        extractOneTextureAtIndex: args.params.extractOneTextureAtIndex,
        cubeTextureRenderLayout: args.params.cubeTextureRenderLayout,
        canvasWidth: args.params.canvasWidth
      });
    }
  }
);

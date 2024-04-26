import { BaseInputParams, BindingTarget, createPlugin, InputBindingPlugin, parseRecord } from '@tweakpane/core';
import * as THREE from 'three';
import { TextureController } from './controller';
import { isTexture } from 'lib/types';

const DEFAULT_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.tif', '.tiff', '.exr', '.hdr', '.tga'];

export interface TexturePluginConfig extends BaseInputParams {
  extensions?: string[];
}

let debugID = 1;

export const TextureBindingPlugin: InputBindingPlugin<THREE.Texture, THREE.Texture, TexturePluginConfig> = createPlugin(
  {
    // api: {},
    id: 'TexturePlugin',
    type: 'input',

    accept: (exValue: unknown, params: Record<string, unknown>) => {
      // console.log('TextureBindingPlugin.accept ?', { params, exValue });
      if (!isTexture(exValue)) {
        return null;
      }

      const result = parseRecord<TexturePluginConfig>(params, (p) => ({
        // view: p.required.constant('texture'), // view is not needed, it is enough that isTexture(exValue)
        extensions: p.optional.array(p.required.string)
      }));
      if (!result) {
        return null;
      }

      // console.log('TextureBindingPlugin.accept !', { exValue, params });
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
        viewProps: args.viewProps
      });
    }
  }
);

import {
  BaseInputParams,
  BindingTarget,
  createPlugin,
  InputBindingPlugin,
  parseRecord
} from '@tweakpane/core';
import { ImageController } from './controller';

const DEFAULT_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.tif',
  '.tiff',
  '.gif',
  '.exr'
];

export interface ImagePluginConfig extends BaseInputParams {
  extensions?: string[];
}

// for preventing spamming the console
let lastValue: any = null;

export const ImageBindingPlugin: InputBindingPlugin<
  HTMLImageElement,
  HTMLImageElement,
  ImagePluginConfig
> = createPlugin({
  // api: {},
  id: 'ImagePlugin',
  type: 'input',
  accept(exValue: unknown, params: Record<string, unknown>) {
    if (!(exValue instanceof HTMLImageElement)) {
      return null;
    }

    const result = parseRecord<ImagePluginConfig>(params, (p) => ({
      view: p.required.constant('image'),
      extensions: p.optional.array(p.required.string)
    }));
    if (!result) {
      return null;
    }

    console.log('ImageBindingPlugin accept', { exValue, params });
    return {
      initialValue: exValue,
      params: params
    };
  },

  binding: {
    reader:
      (_args) =>
      (value: unknown): HTMLImageElement => {
        if (lastValue !== value) {
          console.log('ImageBindingPlugin.binding.reader', value); // value is <img />
          lastValue = value;
        }
        return value instanceof HTMLImageElement ? value : new Image();
      },
    writer: (_args) => (target: BindingTarget, inValue: HTMLImageElement) => {
      console.log('ImageBindingPlugin.binding.writer', inValue?.constructor);
      target.write(inValue);
    }
  },

  controller(args) {
    console.log('ImageBindingPlugin.controller()', { args });
    return new ImageController(args.document, {
      value: args.value,
      extensions: args.params.extensions ?? DEFAULT_EXTENSIONS,
      viewProps: args.viewProps
    });
  }
});

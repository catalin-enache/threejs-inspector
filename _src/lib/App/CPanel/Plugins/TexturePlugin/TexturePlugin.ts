import { TpPluginBundle } from '@tweakpane/core';
import { TextureBindingPlugin } from './binding';

const TexturePlugin: TpPluginBundle = {
  id: 'TextureBundle',
  plugins: [TextureBindingPlugin]
};

export default TexturePlugin;

import { TpPluginBundle } from '@tweakpane/core';
import { ImageBindingPlugin } from './plugin';

const ImagePlugin: TpPluginBundle = {
  id: 'ImageBundle',
  css: `
    .tp-image {align-items: center; display: flex;}
    .tp-image div {color: #00ffd680; flex: 1;}
    .tp-image button {background-color: #00ffd6c0; border-radius: 2px; color: black; height: 20px; width: 20px;}
  `,
  plugins: [ImageBindingPlugin]
};

export default ImagePlugin;

import type { CommonGetterParams } from './bindingTypes';

export const RenderTargetBindings = (_params: CommonGetterParams) => ({
  // keeping texture field out of renderTarget since it needs different configuration depending on context
  width: {
    label: 'Width'
  },
  height: {
    label: 'Height'
  },
  scissor: {
    label: 'Scissor'
  },
  scissorTest: {
    label: 'Scissor Test'
  },
  viewport: {
    label: 'Viewport'
  },
  depthBuffer: {
    label: 'Depth Buffer'
  },
  stencilBuffer: {
    label: 'Stencil Buffer'
  },
  resolveDepthBuffer: {
    label: 'Resolve Depth Buffer'
  },
  resolveStencilBuffer: {
    label: 'Resolve Stencil Buffer'
  },
  // when depthTexture is added to WebGLCubeRenderTarget constructor it throws an error:
  // target.depthTexture not supported in Cube render targets
  // leaving here just in case the commented code
  // depthTexture: {
  //   label: 'Depth Texture',
  //   gl: params.sceneObjects.gl,
  //   init(this: any, { object }: Parameters<init>[0]) {
  //     this.renderTarget = object;
  //   }
  // },
  samples: {
    label: 'Samples'
  }
});

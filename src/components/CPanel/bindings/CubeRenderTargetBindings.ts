import type { CommonGetterParams } from './bindingTypes';
import { RenderTargetBindings } from './RenderTargetBindings';

export const CubeRenderTargetBindings = (params: CommonGetterParams) => ({
  ...RenderTargetBindings(params)
});

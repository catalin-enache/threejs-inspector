/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { init } from '../../../scene';
import { useCallback } from 'react';

interface useToggleTransformSpaceProps {
  forceUpdate: () => void;
  transformControls: any;
  scene: ReturnType<typeof init>;
}
export const useToggleTransformSpace = ({
  forceUpdate,
  transformControls,
  scene
}: useToggleTransformSpaceProps) => {
  return useCallback(() => {
    if (!scene) return;
    const newSpace = transformControls.space === 'local' ? 'world' : 'local';
    transformControls.setSpace(newSpace);
    forceUpdate();
  }, [forceUpdate, scene, transformControls]);
};

import { init } from 'src/scene';
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

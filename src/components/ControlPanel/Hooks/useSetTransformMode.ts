import { useCallback } from 'react';

interface useSetTransformModeProps {
  forceUpdate: () => void;
  transformControls: any;
}
export const useSetTransformMode = ({
  forceUpdate,
  transformControls
}: useSetTransformModeProps) => {
  return useCallback(
    (mode: 'translate' | 'rotate' | 'scale') => () => {
      transformControls.mode = mode;
      forceUpdate();
    },
    [forceUpdate, transformControls]
  );
};

import { useCallback } from 'react';

interface useSetTransformModeProps {
  transformControls: any;
}
export const useSetTransformMode = ({
  transformControls
}: useSetTransformModeProps) => {
  return useCallback(
    (mode: 'translate' | 'rotate' | 'scale') => () => {
      transformControls.setMode(mode);
    },
    [transformControls]
  );
};

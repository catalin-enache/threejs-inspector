import { useCallback } from 'react';
import { CONTROL_EVENT_TYPE, EVENT_TYPE } from '../../../constants.ts';

interface useToggleCameraTypeProps {
  forceUpdate: () => void;
}
export const useToggleCameraType = ({
  forceUpdate
}: useToggleCameraTypeProps) => {
  return useCallback(() => {
    window.dispatchEvent(
      new CustomEvent(EVENT_TYPE.CONTROL, {
        detail: { type: CONTROL_EVENT_TYPE.CAMERA_TYPE }
      })
    );
    forceUpdate();
  }, [forceUpdate]);
};

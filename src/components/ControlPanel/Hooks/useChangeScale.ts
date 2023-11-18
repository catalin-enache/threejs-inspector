import * as THREE from 'three';
import { useCallback } from 'react';
import { STANDARD_CONTROL_EVENT_TYPE, EVENT_TYPE } from 'src/constants.ts';

interface useChangeScaleProps {
  forceUpdate: () => void;
  selectedObject: THREE.Object3D<THREE.Object3DEventMap> | null;
}
export const useChangeScale = ({
  forceUpdate,
  selectedObject
}: useChangeScaleProps) => {
  return useCallback(
    (coordinate: 'x' | 'y' | 'z') => (event: number) => {
      if (!selectedObject) return;
      if (coordinate === 'x') {
        selectedObject.scale.x = event;
      } else if (coordinate === 'y') {
        selectedObject.scale.y = event;
      } else if (coordinate === 'z') {
        selectedObject.scale.z = event;
      }
      window.dispatchEvent(
        new CustomEvent(EVENT_TYPE.STANDARD_CONTROL, {
          detail: {
            type: STANDARD_CONTROL_EVENT_TYPE.SELECTED_OBJECT_TRANSFORM,
            value: selectedObject
          }
        })
      );
      // Object3D has just been updated,
      // so we force a re-render to update ControlPanel
      forceUpdate();
    },
    [forceUpdate, selectedObject]
  );
};

import * as THREE from 'three';
import { useCallback } from 'react';
import { STANDARD_CONTROL_EVENT_TYPE, EVENT_TYPE } from 'old_src/constants';

interface useChangePositionProps {
  selectedObject: THREE.Object3D<THREE.Object3DEventMap> | null;
}
export const useChangePosition = ({
  selectedObject
}: useChangePositionProps) => {
  return useCallback(
    (coordinate: 'x' | 'y' | 'z') => (event: number) => {
      if (!selectedObject) return;
      if (coordinate === 'x') {
        selectedObject.position.x = event;
      } else if (coordinate === 'y') {
        selectedObject.position.y = event;
      } else if (coordinate === 'z') {
        selectedObject.position.z = event;
      }
      window.dispatchEvent(
        new CustomEvent(EVENT_TYPE.STANDARD_CONTROL, {
          detail: {
            type: STANDARD_CONTROL_EVENT_TYPE.SELECTED_OBJECT_TRANSFORM,
            value: selectedObject
          }
        })
      );
    },
    [selectedObject]
  );
};

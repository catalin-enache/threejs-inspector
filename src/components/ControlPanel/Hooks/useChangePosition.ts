/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as THREE from 'three';
import { useCallback } from 'react';
import { STANDARD_CONTROL_EVENT_TYPE, EVENT_TYPE } from 'src/constants.ts';

interface useChangePositionProps {
  forceUpdate: () => void;
  selectedObject: THREE.Object3D<THREE.Object3DEventMap> | null;
}
export const useChangePosition = ({
  forceUpdate,
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
      // Object3D has just been updated from previous dispatched Event,
      // so we force a re-render to update the UI
      forceUpdate();
    },
    [forceUpdate, selectedObject]
  );
};

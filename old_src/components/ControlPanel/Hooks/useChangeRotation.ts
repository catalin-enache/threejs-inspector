import * as THREE from 'three';
import { useCallback } from 'react';
import { STANDARD_CONTROL_EVENT_TYPE, EVENT_TYPE } from 'old_src/constants';

interface useChangeRotationProps {
  selectedObject: THREE.Object3D<THREE.Object3DEventMap> | null;
}
export const useChangeRotation = ({
  selectedObject
}: useChangeRotationProps) => {
  return useCallback(
    (coordinate: 'x' | 'y' | 'z') => (degree: number) => {
      if (!selectedObject) return;
      const radian = THREE.MathUtils.degToRad(degree);
      if (coordinate === 'x') {
        selectedObject.rotation.x = radian;
      } else if (coordinate === 'y') {
        selectedObject.rotation.y = radian;
      } else if (coordinate === 'z') {
        selectedObject.rotation.z = radian;
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

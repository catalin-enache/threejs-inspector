import * as THREE from 'three';
import { useCallback } from 'react';
import { STANDARD_CONTROL_EVENT_TYPE, EVENT_TYPE } from 'src/constants.ts';

interface useTranslateProps {
  selectedObject: THREE.Object3D<THREE.Object3DEventMap> | null;
}
export const useTranslate = ({ selectedObject }: useTranslateProps) => {
  return useCallback(() => {
    if (!selectedObject) return;
    // const axis = new THREE.Vector3(
    //   selectedObject.userData.translationDistance?.x || 0,
    //   selectedObject.userData.translationDistance?.y || 0,
    //   selectedObject.userData.translationDistance?.z || 0
    // ).normalize();
    // selectedObject.translateOnAxis(axis, 1);

    selectedObject.translateX(
      selectedObject.userData.translationDistance?.x || 0
    );
    selectedObject.translateY(
      selectedObject.userData.translationDistance?.y || 0
    );
    selectedObject.translateZ(
      selectedObject.userData.translationDistance?.z || 0
    );

    window.dispatchEvent(
      new CustomEvent(EVENT_TYPE.STANDARD_CONTROL, {
        detail: {
          type: STANDARD_CONTROL_EVENT_TYPE.SELECTED_OBJECT_TRANSFORM,
          value: selectedObject
        }
      })
    );
  }, [selectedObject]);
};

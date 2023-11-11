/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as THREE from 'three';
import { useCallback } from 'react';

interface useTranslateProps {
  forceUpdate: () => void;
  selectedObject: THREE.Object3D<THREE.Object3DEventMap> | null;
}
export const useTranslate = ({
  forceUpdate,
  selectedObject
}: useTranslateProps) => {
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

    forceUpdate();
  }, [forceUpdate, selectedObject]);
};

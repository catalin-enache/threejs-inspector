/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as THREE from 'three';
import { useCallback } from 'react';

interface useChangeTranslationDistanceProps {
  forceUpdate: () => void;
  selectedObject: THREE.Object3D<THREE.Object3DEventMap> | null;
}
export const useChangeTranslationDistance = ({
  forceUpdate,
  selectedObject
}: useChangeTranslationDistanceProps) => {
  return useCallback(
    (coordinate: 'x' | 'y' | 'z') => (event: number) => {
      if (!selectedObject) return;
      selectedObject.userData.translationDistance = {
        ...selectedObject.userData.translationDistance,
        [coordinate]: event
      };
      forceUpdate();
    },
    [forceUpdate, selectedObject]
  );
};

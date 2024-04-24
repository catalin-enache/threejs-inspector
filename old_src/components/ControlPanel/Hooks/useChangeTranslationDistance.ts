import * as THREE from 'three';
import { useCallback } from 'react';
import { UserData } from 'old_src/types';

interface useChangeTranslationDistanceProps {
  selectedObject: THREE.Object3D<THREE.Object3DEventMap> | null;
}
export const useChangeTranslationDistance = ({
  selectedObject
}: useChangeTranslationDistanceProps) => {
  return useCallback(
    (coordinate: 'x' | 'y' | 'z') => (event: number) => {
      if (!selectedObject) return;
      const userData = selectedObject.userData as UserData;
      userData.translationDistance = {
        ...selectedObject.userData.translationDistance,
        [coordinate]: event
      };
    },
    [selectedObject]
  );
};

import * as THREE from 'three';

type GetMapsForMaterialResult = {
  name: string;
  present: boolean;
};

export const getMapsKeysForMaterial = (material: THREE.Material): GetMapsForMaterialResult[] => {
  const maps: GetMapsForMaterialResult[] = [];
  Object.keys(material).forEach((key) => {
    if (key === 'map' || key.endsWith('Map')) {
      maps.push({
        name: key,
        present: !!(material as any)[key] // using 'any' to bypass strict typing
      });
    }
  });
  return maps;
};

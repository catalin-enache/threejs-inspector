import * as THREE from 'three';

type GetMapsForMaterialResult = {
  name: string;
  present: boolean;
};

export const getMapsKeysForMaterial = (material: THREE.Material): GetMapsForMaterialResult[] => {
  const maps: GetMapsForMaterialResult[] = [];
  Object.keys(material).forEach((key) => {
    // bck_ is used to store temporary disabled maps in MaterialEditForm
    if ((key === 'map' || key.endsWith('Map')) && !key.startsWith('bck_')) {
      maps.push({
        name: key,
        present: !!(material as any)[key] // using 'any' to bypass strict typing
      });
    }
  });
  return maps;
};

export type GetMaterialFromTypeParams =
  | ConstructorParameters<typeof THREE.LineBasicMaterial>[0]
  | ConstructorParameters<typeof THREE.LineDashedMaterial>[0]
  | ConstructorParameters<typeof THREE.MeshBasicMaterial>[0]
  | ConstructorParameters<typeof THREE.MeshDepthMaterial>[0]
  | ConstructorParameters<typeof THREE.MeshDistanceMaterial>[0]
  | ConstructorParameters<typeof THREE.MeshLambertMaterial>[0]
  | ConstructorParameters<typeof THREE.MeshMatcapMaterial>[0]
  | ConstructorParameters<typeof THREE.MeshNormalMaterial>[0]
  | ConstructorParameters<typeof THREE.MeshPhongMaterial>[0]
  | ConstructorParameters<typeof THREE.MeshPhysicalMaterial>[0]
  | ConstructorParameters<typeof THREE.MeshStandardMaterial>[0]
  | ConstructorParameters<typeof THREE.MeshToonMaterial>[0]
  | ConstructorParameters<typeof THREE.PointsMaterial>[0]
  | ConstructorParameters<typeof THREE.RawShaderMaterial>[0]
  | ConstructorParameters<typeof THREE.ShaderMaterial>[0]
  | ConstructorParameters<typeof THREE.ShadowMaterial>[0]
  | ConstructorParameters<typeof THREE.SpriteMaterial>[0]
  | undefined;

export const getMaterialFromType = (type: string, params?: GetMaterialFromTypeParams) => {
  switch (type) {
    case 'LineBasicMaterial':
      return new THREE.LineBasicMaterial(params);
    case 'LineDashedMaterial':
      return new THREE.LineDashedMaterial(params);
    case 'MeshBasicMaterial':
      return new THREE.MeshBasicMaterial(params);
    case 'MeshDepthMaterial':
      return new THREE.MeshDepthMaterial(params);
    case 'MeshDistanceMaterial':
      return new THREE.MeshDistanceMaterial(params);
    case 'MeshLambertMaterial':
      return new THREE.MeshLambertMaterial(params as ConstructorParameters<typeof THREE.MeshLambertMaterial>[0]);
    case 'MeshMatcapMaterial':
      return new THREE.MeshMatcapMaterial(params);
    case 'MeshNormalMaterial':
      return new THREE.MeshNormalMaterial(params);
    case 'MeshPhongMaterial':
      return new THREE.MeshPhongMaterial(params);
    case 'MeshPhysicalMaterial':
      return new THREE.MeshPhysicalMaterial(params);
    case 'MeshStandardMaterial':
      return new THREE.MeshStandardMaterial(params);
    case 'MeshToonMaterial':
      return new THREE.MeshToonMaterial(params);
    case 'PointsMaterial':
      return new THREE.PointsMaterial(params);
    case 'RawShaderMaterial':
      return new THREE.RawShaderMaterial(params);
    case 'ShaderMaterial':
      return new THREE.ShaderMaterial(params);
    case 'ShadowMaterial':
      return new THREE.ShadowMaterial(params);
    case 'SpriteMaterial':
      return new THREE.SpriteMaterial(params);
    default:
      throw new Error(`Unknown material type: ${type}`);
  }
};

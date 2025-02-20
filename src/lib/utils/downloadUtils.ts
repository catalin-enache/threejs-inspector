import * as THREE from 'three';

export const ExportableTypes = new Set([
  // Types supported by ObjectLoader => see three repo
  'Scene',
  'PerspectiveCamera',
  'OrthographicCamera',
  'AmbientLight',
  'DirectionalLight',
  'PointLight',
  'RectAreaLight',
  'SpotLight',
  'HemisphereLight',
  'LightProbe',
  'SkinnedMesh',
  'Mesh',
  'InstancedMesh',
  'BatchedMesh',
  'LOD',
  'Line',
  'LineLoop',
  'LineSegments',
  'PointCloud',
  'Points',
  'Sprite',
  'Group',
  'Bone',
  // extra objects that we tweaked to be exportable
  'CubeCamera',
  // -------
  'Object3D' // the default in ObjectLoader
]);

type JsonType = 'json' | 'bson' | 'ejson';
type SerializeOptions = { type?: JsonType };

/*
Note: Certain textures used in custom shaders cannot be serialised.
AFAIK these textures are ones that look like { width  height  depth } (isRenderTargetTexture)
and need to be extracted from GPU.
* */
export const serializeObject = async (object: any, { type = 'json' }: SerializeOptions = {}) => {
  const { BSON, EJSON } = await import('bson');
  const json = object.toJSON();

  return type === 'bson'
    ? BSON.serialize(json, {
        // const MAXSIZE = 1024 * 1024 * 17; // default defined in bson, internal
        // @ts-ignore minInternalBufferSize is internal
        minInternalBufferSize: 4096 * 4096 * 64 // cannot be greater than that, or it complains it cannot allocate memory
      }) // much larger file
    : type === 'ejson'
      ? EJSON.stringify(json) // from observation, it does not apply roundings to floats
      : JSON.stringify(json);
};

export const downloadObject = async (object: any, { type = 'json' }: SerializeOptions = {}) => {
  const serialized = await serializeObject(object, { type });
  const blob = new Blob([serialized], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${object.name || object.uuid || 'object'}.${type === 'bson' ? 'bson' : type === 'ejson' ? 'ejson' : 'json'}`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportObject = async (object: any, { type = 'json' }: SerializeOptions = {}) => {
  const detachable: { detached: any; detachedParent: any; detachedOwner: any }[] = [];
  const isDetached = (object: any) => detachable.some((entry) => entry.detached === object);

  object.traverse((child: THREE.Object3D) => {
    while (child.__inspectorData.dependantObjects?.length) {
      const dep = child.__inspectorData.dependantObjects.pop()!;
      const depParent = dep.parent!;
      detachable.push({ detached: dep, detachedParent: depParent, detachedOwner: child });
    }
    if (['DefaultTransformControls'].includes(child.name) || ['AxesHelper', 'GridHelper'].includes(child.type)) {
      detachable.push({ detached: child, detachedParent: child.parent, detachedOwner: null });
    }
    if (!ExportableTypes.has(child.type)) {
      if (!isDetached(child)) {
        console.log('detaching', child.type, child.name, 'as it is not handled by ObjectLoader', child);
        detachable.push({ detached: child, detachedParent: child.parent, detachedOwner: null });
      }
    }
    // before exporting to json we copy the isInspectable flag from __inspectorData to userData
    // in order to make it back inspectable after importing
    if (child.__inspectorData.isInspectable) {
      child.userData = { ...(child.userData || {}), isInspectable: true };
    }
  });

  detachable.forEach(({ detached }) => {
    detached.removeFromParent();
  });

  await downloadObject(object, { type });

  while (detachable.length) {
    const { detached, detachedParent, detachedOwner } = detachable.pop()!;
    detachedParent.add(detached);
    if (detachedOwner) {
      detachedOwner.__inspectorData.dependantObjects.push(detached);
    }
  }
};

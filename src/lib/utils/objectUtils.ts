import * as THREE from 'three';

export const objectHasSkeleton = (object: THREE.Object3D) => {
  let hasSkeleton = false;
  object.traverse((descendant) => {
    if (descendant instanceof THREE.SkinnedMesh) {
      hasSkeleton = true;
    }
  });
  return hasSkeleton;
};

export const isAutoInspectableObject = (object: THREE.Object3D) => {
  return (
    object instanceof THREE.Light ||
    object instanceof THREE.Camera ||
    object instanceof THREE.CubeCamera ||
    object instanceof THREE.PositionalAudio
  );
};

type CallbackArgs = {
  value: any;
  path: (string | number)[]; // keysIndexes is a tuple of key and index
  ancestors: any[];
};

type FilterArgs = {
  value: any;
  parent: any[];
  path: (string | number)[];
  key: string | number | null;
};

function getAllPropertyNames(obj: any, { excludeFunctions = false }: { excludeFunctions?: boolean } = {}) {
  const props = new Set();
  let _obj = obj;
  // Traverse the prototype chain.
  while (_obj && _obj !== Array.prototype && _obj !== Object.prototype) {
    Object.getOwnPropertyNames(_obj).forEach((prop) => props.add(prop));
    _obj = Object.getPrototypeOf(_obj);
  }

  const toReturn = Array.from(props).filter(
    // @ts-ignore
    (prop) => !['constructor', 'caller', 'calle', 'arguments', 'cssRules', 'rules'].includes(prop)
  );
  if (excludeFunctions) {
    // @ts-ignore
    return toReturn.filter((prop) => typeof obj[prop] !== 'function');
  }
  return toReturn;
}

export const deepTraverse = (
  value: any,
  callback: ({ value, path, ancestors }: CallbackArgs) => void,
  filter: (args: FilterArgs) => boolean = () => true,
  _path: (string | number)[] = [],
  _ancestors: any[] = [],
  _encountered: Set<any> = new Set()
) => {
  const parent = _ancestors[_ancestors.length - 1] || null;
  const key = _path[_path.length - 1];

  if (filter({ value, parent, key, path: [..._path] })) {
    callback({ value, path: [..._path], ancestors: [..._ancestors] });
  }

  if (
    value === null ||
    value === undefined ||
    Number.isNaN(value) ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    value instanceof HTMLElement ||
    _encountered.has(value) ||
    [
      Int8Array,
      Uint8Array,
      Int16Array,
      Uint16Array,
      Int32Array,
      Uint32Array,
      Float32Array,
      Float64Array,
      Uint8ClampedArray
    ].some((type) => value instanceof type)
  ) {
    return;
  }

  _encountered.add(value);

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      deepTraverse(item, callback, filter, [..._path, index], [..._ancestors, value], _encountered);
    });
  } else {
    getAllPropertyNames(value, { excludeFunctions: true }).forEach((key: any) => {
      const field = value[key];
      if (['_innerInspectorData', 'parent'].includes(key)) return;
      deepTraverse(field, callback, filter, [..._path, key], [..._ancestors, value], _encountered);
    });
  }
};

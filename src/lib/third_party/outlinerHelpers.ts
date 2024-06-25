import * as THREE from 'three';
// @ts-ignore
import { outliner } from 'lib/third_party/ui.outliner';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { useAppStore } from 'src/store';
import { debounce } from 'lib/utils/debounce';

const nodeStates = new WeakMap();

const isNotUselessObject = (object: THREE.Object3D) => {
  return !(object instanceof TransformControls || object.__inspectorData.isPicker || object.__inspectorData.isHelper);
};

const objectMatchesSearch = (object: THREE.Object3D): boolean => {
  const outlinerSearch = useAppStore.getState().outlinerSearch.toLowerCase();
  if (!outlinerSearch) return true;

  const objectMaterials = (
    Array.isArray((object as THREE.Mesh).material) ? (object as THREE.Mesh).material : [(object as THREE.Mesh).material]
  ) as THREE.Material[];

  const searchIn = [
    object.name,
    object.type,
    object.id,
    object.uuid,
    (object as THREE.Mesh).geometry?.name,
    (object as THREE.Mesh).geometry?.id,
    (object as THREE.Mesh).geometry?.uuid,
    ...objectMaterials.map((material) => material?.name),
    ...objectMaterials.map((material) => material?.id),
    ...objectMaterials.map((material) => material?.uuid)
  ].map((s) => (s ?? '').toString().toLowerCase());

  const objectIsMatch = searchIn.some((entry) => entry.includes(outlinerSearch));
  const isNotUseless = isNotUselessObject(object);
  if (objectIsMatch && isNotUseless) {
    return true;
  } else if (object.children.length) {
    return object.children.some((child) => {
      return objectMatchesSearch(child);
    });
  }
  return false;
};

const filterObject = (object: THREE.Object3D) => {
  return isNotUselessObject(object) && objectMatchesSearch(object);
};

export function buildOption(object: THREE.Object3D | THREE.Mesh, { scene }: { scene: THREE.Scene }) {
  const option = document.createElement('div');
  option.innerHTML = buildHTML(object);
  // @ts-ignore
  option.value = object.id;

  // opener

  if (nodeStates.has(object)) {
    const state = nodeStates.get(object);

    const opener = document.createElement('span');
    opener.classList.add('opener');

    const children = object.children.filter(filterObject);

    if (children.length) {
      opener.classList.add(state ? 'open' : 'closed');
    }

    opener.addEventListener('click', function () {
      nodeStates.set(object, !nodeStates.get(object)); // toggle
      refreshOutliner({ scene });
    });

    option.insertBefore(opener, option.firstChild);
  }

  return option;
}

export function getMaterialName(material: THREE.Material | THREE.Material[]) {
  if (Array.isArray(material)) {
    const array = [];

    for (let i = 0; i < material.length; i++) {
      array.push(material[i].name);
    }

    return array.join(',');
  }

  return material.name;
}

export function escapeHTML(html: string) {
  return html
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function getObjectType(object: any) {
  if (object.isScene) return 'Scene';
  if (object.isCamera) return 'Camera';
  if (object.isLight) return 'Light';
  if (object.isMesh) return 'Mesh';
  if (object.isLine) return 'Line';
  if (object.isPoints) return 'Points';

  return 'Object3D';
}

const getShortUUID = (object: any) => (object.uuid || '').split('-').shift();

export function buildHTML(object: THREE.Object3D | THREE.Mesh | THREE.Camera) {
  let html = `<span class="type ${getObjectType(object)}"></span> ${escapeHTML(object.name || `${object.type} - ${getShortUUID(object)}`)}`;

  if (object instanceof THREE.Mesh) {
    const geometry = object.geometry;
    const material = object.material;

    html += ` <span class="type Geometry"></span> ${escapeHTML(geometry.name || getShortUUID(geometry))}`;
    html += ` <span class="type Material"></span> ${escapeHTML(getMaterialName(material) || getShortUUID(material))}`;
  }

  return html;
}

export function refreshOutliner({ scene }: { scene: THREE.Scene }) {
  if (!scene) return;
  const options = [];

  (function addObjects(objects, pad) {
    for (let i = 0, l = objects.length; i < l; i++) {
      const object = objects[i];
      if (!filterObject(object)) continue;

      if (!nodeStates.has(object)) {
        nodeStates.set(object, false);
      }

      const option = buildOption(object, { scene }); // draggable was true here
      option.style.paddingLeft = pad * 18 + 'px';
      options.push(option);

      if (nodeStates.get(object) === true) {
        addObjects(object.children, pad + 1);
      }
    }
  })(scene.children, 0);

  outliner.setOptions(options);
}

const debouncedRefreshOutliner = debounce(() => {
  refreshOutliner({ scene: outliner.scene });
}, 300);

useAppStore.subscribe((appStore) => appStore.outlinerSearch, debouncedRefreshOutliner);

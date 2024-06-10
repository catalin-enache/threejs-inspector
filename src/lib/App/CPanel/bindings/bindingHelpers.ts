import * as THREE from 'three';
import { BindingApi } from '@tweakpane/core';
import { FolderApi, TabPageApi, BladeApi } from 'tweakpane';
import { degToRad, radToDegFormatter } from 'lib/utils';
import { getObject3DBindings } from './getBindings';
import { ParentBindings } from './ParentBindings';
import { CommonGetterParams } from './bindingTypes';
import { MaterialBindings } from './MaterialBindings';
import { animate } from 'lib/utils/animate';
import { isValidTexture } from 'src/types';

const cachedBindings = new WeakMap<any, any>();

export const numberFormat = (precision: number) => (value: number) => value.toFixed(precision);

export const numberCommon = {
  keyScale: 0.1,
  pointerScale: 0.001,
  // Note: this step might be doing scene flickering if not enough precision
  // (3 decimals should be enough precision)
  step: 0.001,
  format: numberFormat(3)
};

const adjustCPanelWidthFromNestedExpandedFolders = () => {
  const cPanelContainer = document.getElementById('controlPanel')!;
  const cPanelStyle = cPanelContainer!.style;
  const buttons = cPanelContainer.querySelectorAll('button');
  let max = 0;
  buttons.forEach((button) => {
    let walker: HTMLElement = button;
    let _max = 0;
    while (walker) {
      walker = walker?.parentNode as HTMLElement;
      if (!walker) break;
      if (walker.classList?.contains('folder-button') && [...walker.classList].some((c) => c.endsWith('expanded'))) {
        _max += 1;
      }
    }
    max = Math.max(max, _max);
  });

  cPanelStyle.setProperty('--cPanelNestingOffset', 10 * max + 'px');
};

export function rotationHandler(this: HTMLInputElement, e: Event) {
  // @ts-ignore
  e.target.value = +degToRad(e.target.value);
}

export const makeRotationBinding = (binding: BindingApi) => {
  binding.controller.view.valueElement.querySelectorAll('input').forEach((input) => {
    input.addEventListener('change', rotationHandler, true);
  });
  return binding;
};

export const tweakBindingView = (binding: BladeApi) => {
  binding.element.classList.add('binding');
  const view = binding.controller.view as any;
  view.labelElement.classList.add('binding-label');
  view.labelElement.title = view.labelElement.textContent!;
  view.valueElement.classList.add('binding-value');
  return binding;
};

const foldersExpandedMap = {} as Record<string, boolean>;
// memoize folder expanded state
export const tweakFolder = (folder: FolderApi | TabPageApi, id: string) => {
  if (folder instanceof TabPageApi) return;
  if (foldersExpandedMap[id] !== undefined) {
    folder.expanded = foldersExpandedMap[id];
  } else {
    foldersExpandedMap[id] = folder.expanded;
  }
  folder.element.classList.add('folder-button');
  const folderButton = folder.element.children[0];

  // Memoizing last expanded state
  folderButton.addEventListener('click', () => {
    // folderButton.parentNode is the same as folder.element;
    foldersExpandedMap[id] = [...(folderButton.parentNode as HTMLElement)!.classList].some((c) =>
      c.endsWith('expanded')
    );
  });

  // Tweakpane assumes that changes in sizes are transitioned,
  // and it expects transitionend event to update folder heights.
  // We have overridden all transitions in CSS to prevent CPanel animating on every rebuild.
  // Here we're dispatching transitionend event to fix folders heights.
  // buttons include the folderButton
  const buttons = folder.element.querySelectorAll('button');
  buttons.forEach((anyButton) => {
    // Note: tweakFolder is called recursively
    // Last call is from root folder.
    // Before root folder is calling tweakFolder,
    // the inner folders have already called it (adding their own listeners on buttons).
    // We guard with 'button' class.
    // Returning early to prevent adding duplicated listeners.
    if (anyButton.classList.contains('button')) return;
    anyButton.classList.add('button');
    anyButton.addEventListener('click', (_e) => {
      // Dispatching from deepest to top.
      // The event will be handled by all interested ancestors.
      anyButton.dispatchEvent(
        new TransitionEvent('transitionend', {
          bubbles: true,
          cancelable: true,
          propertyName: 'height'
        })
      );
      adjustCPanelWidthFromNestedExpandedFolders();
    });
  });
};

const _buildParentBindings = (folder: FolderApi, object: any, params: CommonGetterParams) => {
  if (object.parent) {
    const parentFolder = folder.addFolder({
      title: 'Parent',
      expanded: false
    });
    tweakFolder(parentFolder, `${parentFolder.title!}-${object.parent.uuid || 'no-id'}`);
    const parentBindings = ParentBindings(params);
    Object.keys(parentBindings.parent).forEach((key) => {
      // @ts-ignore
      const bindingCandidate = parentBindings.parent[key];
      const binding = parentFolder.addBinding(object.parent, key, bindingCandidate);
      tweakBindingView(binding);
    });
  }
};

const _buildBindings = (folder: FolderApi, object: any, bindings: any, params: CommonGetterParams) => {
  // console.log('_buildBindings for', folder.title, { object, bindings });

  _buildParentBindings(folder, object, params);

  Object.keys(bindings).forEach((key) => {
    const bindingCandidate = bindings[key];

    const isButton = bindingCandidate.title && bindingCandidate.label;

    if (isButton) {
      const button = folder.addButton({
        label: bindingCandidate.label,
        title: bindingCandidate.title
      });
      button.on('click', bindingCandidate.onClick.bind(null, { object, folder, bindings }));
      tweakBindingView(button);
      return;
    }

    if (
      key === 'title' ||
      object[key] === undefined ||
      object[key] === null ||
      (object[key] instanceof THREE.Texture && !isValidTexture(object[key]))
    )
      return;

    // handle material case which can be a Material or an array of Materials
    if (Array.isArray(object[key])) {
      // We do not need a Set here because we want to show everything as is.
      object[key].forEach((item: any, index: number) => {
        const subFolder = folder.addFolder({
          title: `${key} ${index}`,
          expanded: false
        });
        try {
          _buildBindings(subFolder, item, bindingCandidate, params);
        } catch (error) {
          console.error('Error building bindings for', key, { error });
        }
      });
      return;
    }

    const isFolder = bindingCandidate.title;
    const isBinding = bindingCandidate.label;

    if (isFolder) {
      const subFolder = folder.addFolder({
        title: `${bindingCandidate.title}`,
        expanded: false
      });
      bindingCandidate.__parent = object;
      try {
        _buildBindings(subFolder, object[key], bindingCandidate, params);
      } catch (error) {
        console.error('Error building bindings for', key, { error });
      }

      return;
    }

    if (!isBinding) return;
    if (bindingCandidate.if && !bindingCandidate.if(object)) return;
    // Forcing all pickers inline to prevent layout issues.
    // Not all bindings have pickers but there's no harm in setting it inline even if there's no picker
    bindingCandidate.picker = 'inline';

    const binding = folder.addBinding(object, key, bindingCandidate);
    // @ts-ignore
    if (object instanceof THREE.Material && object[key] instanceof THREE.Texture) {
      binding.on('change', (_evt) => {
        // @ts-ignore
        // console.log('change', { _evt, key, object, 'object[key]': object[key] });
        // This is not usually needed unless the shader code depends on something specific from the texture.
        // It targets the change of texture as a field in material (e.g. map, envMap, etc.).
        // When a texture prop changes the material is also updated but not with this handler. It is done in MaterialBindings onDetailsChange.
        object.needsUpdate = true;
      });
    }

    if (bindingCandidate.onChange) {
      binding.on('change', bindingCandidate.onChange.bind(null, { object, folder, bindings }));
    }

    // Special kind of subFolder allowing a prop to be both a value and a folder.
    // For example a texture can be handled as a value, allowing changing the image and as a folder allowing changing other texture properties.
    if (bindingCandidate.details) {
      const subFolder = folder.addFolder({
        title: `${bindingCandidate.label} Details ${object.uuid.split('-')[0]}-${object.id}`,
        expanded: false
      });

      bindingCandidate.details.__parent = object;
      if (bindingCandidate.details.onDetailsChange) {
        // console.log('candidate.details.onChange', { 'candidate.details': bindingCandidate.details, object, 'object[key]': object[key], binding });
        subFolder.on(
          'change',
          bindingCandidate.details.onDetailsChange.bind(null, {
            object: object[key],
            folder: subFolder,
            bindings: bindingCandidate.details
          })
        );
        delete bindingCandidate.details.onDetailsChange;
      }
      try {
        _buildBindings(subFolder, object[key], bindingCandidate.details, params);
      } catch (error) {
        console.error('Error building bindings for', key, { error });
      }
    }

    tweakBindingView(binding);

    if (bindingCandidate.format === radToDegFormatter) {
      makeRotationBinding(binding);
    }
  });

  // Collecting animations
  // TODO: Later on add more capabilities to animations (blending, editing, ...)
  if (object.animations && object.animations.length) {
    const animationsFolder = folder.addFolder({
      title: `Animations (${object.animations.length})`,
      expanded: false
    });
    tweakFolder(animationsFolder, `${animationsFolder.title!}-${object.uuid || 'no-id'}`);

    const inspectorData = object.__inspectorData;

    // reuse existing mixer and actions if available so that we can select other objects then came back to prev object and stop actions
    inspectorData.cpMixer = inspectorData.cpMixer ?? new THREE.AnimationMixer(object);
    const mixer = inspectorData.cpMixer;
    inspectorData.cpStartStop = inspectorData.cpStartStop ?? animate((delta) => mixer.update(delta), object);
    inspectorData.cpActions = inspectorData.cpActions ?? new Map();
    const { start, stop } = inspectorData.cpStartStop;
    const actions = inspectorData.cpActions;

    object.animations.forEach((animation: THREE.AnimationClip) => {
      const actionID = animation.name || animation.uuid;
      let action;
      if (actions.has(animation)) {
        action = actions.get(animation);
      } else {
        action = mixer.clipAction(animation);
        actions.set(animation, action);
      }
      const button = animationsFolder.addButton({
        label: actionID,
        title: actionID
      });
      button.on('click', () => {
        if (action.isRunning()) {
          action.paused = true;
          stop();
        } else {
          if (inspectorData.__cpCurrentPlayingAction === action) {
            action.paused = false;
            start();
          } else {
            mixer.stopAllAction();
            inspectorData.__cpCurrentPlayingAction = action;
            action.play();
            start();
          }
        }
      });
      tweakBindingView(button);
    });
    const button = animationsFolder.addButton({
      label: 'Reset',
      title: 'Reset'
    });
    button.on('click', () => {
      mixer.stopAllAction();
      inspectorData.__cpCurrentPlayingAction = null;
      stop();
    });
    tweakBindingView(button);
  }

  // Collecting all morph targets from all meshes grouped by name.
  // As an edge case if 2 original meshes (before optimization done by loadModel) had the same morph target name
  // they will be grouped together
  if (folder.title === 'Object3D' && object.traverse) {
    const morphInfluences: Record<string, { index: number; influences: number[] }[]> = {};
    const fakeParams: Record<string, number> = {};
    object.traverse((child: any) => {
      if (child instanceof THREE.Mesh) {
        Object.keys(child.morphTargetDictionary || {}).forEach((key) => {
          if (!morphInfluences[key]) {
            morphInfluences[key] = [];
            // all influences for some key should be equal
            fakeParams[key] = child.morphTargetInfluences![child.morphTargetDictionary![key]];
          }
          morphInfluences[key].push({
            index: child.morphTargetDictionary![key],
            influences: child.morphTargetInfluences!
          }); // morphTargetDictionary implies morphTargetInfluences
        });
      }
    });
    if (Object.keys(morphInfluences).length) {
      folder.addBlade({
        view: 'separator'
      });
      const morphFolder = folder.addFolder({
        title: `Morph Targets (${Object.keys(morphInfluences).length})`,
        expanded: false
      });
      tweakFolder(morphFolder, `${morphFolder.title!}-${object.uuid || 'no-id'}`);
      Object.keys(morphInfluences).forEach((key: string) => {
        const binding = morphFolder
          .addBinding(fakeParams, key, {
            label: key,
            min: 0,
            max: 1,
            ...numberCommon
          })
          .on('change', (evt) => {
            morphInfluences[key].forEach((influence) => {
              influence.influences[influence.index] = evt.value;
            });
          });
        tweakBindingView(binding);
      });
    }
  }

  //  Collecting materials from all children
  if (folder.title === 'Object3D' && object.traverse) {
    // console.log('Extracting materials');
    // root object
    const materials = new Set<THREE.Material>();
    object.traverse((child: any) => {
      if (child === object || child.__inspectorData.isPicker) return;
      if (child instanceof THREE.Mesh && child.material) {
        // console.log('Material found', child.material);
        const matArray = Array.isArray(child.material) ? child.material : [child.material];
        matArray.forEach((material) => {
          materials.add(material);
        });
      }
    });
    const materialsArray = Array.from(materials);

    if (materialsArray.length) {
      folder.addBlade({
        view: 'separator'
      });
      const materialsFolder = folder.addFolder({
        title: `Materials Inventory (${materialsArray.length})`,
        expanded: false
      });
      tweakFolder(materialsFolder, `${materialsFolder.title!}-${object.uuid || 'no-id'}`);
      materialsArray.forEach((material, index) => {
        const subFolder = materialsFolder.addFolder({
          title: material.name || `Material ${index}`,
          expanded: false
        });
        try {
          _buildBindings(subFolder, material, MaterialBindings(params), params);
        } catch (error) {
          console.error('Error building bindings for', material.name || material.uuid, { material, error });
        }
      });
      object.children.length &&
        folder.addBlade({
          view: 'separator'
        });
    }
  }

  // TODO: try to put this in Object3DBindings, same for other sections in this function (we need some new logic for that)
  // morphTargetInfluences
  if (folder.title !== 'Object3D' && Object.keys(object.morphTargetDictionary || {})?.length) {
    const morphFolder = folder.addFolder({
      title: `Morph Targets (${object.morphTargetInfluences.length})`,
      expanded: false
    });
    tweakFolder(morphFolder, `${morphFolder.title!}-${object.uuid || 'no-id'}`);
    Object.keys(object.morphTargetDictionary).forEach((key: string, index: number) => {
      const binding = morphFolder.addBinding(object.morphTargetInfluences, index, {
        label: key,
        min: 0,
        max: 1,
        ...numberCommon
      });
      tweakBindingView(binding);
    });
  }

  // build descendants tree excluding the scene
  const objectChildren =
    object instanceof THREE.Scene
      ? []
      : object.children?.map((child: any) => !child.__inspectorData.isPicker && child).filter(Boolean) || [];
  if (objectChildren.length) {
    const childrenFolder = folder.addFolder({
      title: `Children (${objectChildren.length})`,
      expanded: false
    });
    tweakFolder(childrenFolder, `${childrenFolder.title!}-${object.uuid || 'no-id'}`);
    objectChildren.forEach(function (child: any) {
      const childFolder = childrenFolder.addFolder({
        title: `${child.name || child.uuid}`,
        expanded: false
      });
      let hasBinding = cachedBindings.has(child);
      if (hasBinding) {
        try {
          _buildBindings(childFolder, child, cachedBindings.get(child), params);
        } catch (error) {
          console.error('Error building bindings for', child.name || child.uuid, { error });
        }
      } else {
        childFolder.on('fold', (evt) => {
          if (evt.expanded && !hasBinding) {
            try {
              const newBindings = getObject3DBindings(params);
              cachedBindings.set(child, newBindings);
              hasBinding = true;
              // lazy building bindings for children
              _buildBindings(childFolder, child, newBindings, params);
            } catch (error) {
              console.error('Error building bindings for', child.name || child.uuid, { error });
            }
          }
        });
      }
    });
  }

  // Using it at the end so that inside tweakFolder()
  // we can access all buttons added so far by inner folders.
  tweakFolder(folder, `${folder.title!}-${object.uuid || 'no-id'}`);
};

export const buildBindings = (folder: FolderApi, object: any, bindings: any, params: CommonGetterParams) => {
  try {
    return _buildBindings(folder, object, bindings, params);
  } catch (error) {
    console.error('Error building bindings', { folder, object, bindings, error });
  }
};

export const cleanupContainer = (container: any) => {
  if (!container.children) return;
  container.children.forEach((child: any) => {
    cleanupContainer(child);
    // console.log(
    //   'cleanupContainer',
    //   child.title ? `folder ${child.title}` : `binding ${child.key}`
    // );
    window.dispatchEvent(
      new CustomEvent('TweakpaneRemove', {
        detail: {
          container,
          child
        }
      })
    );
    container.remove(child);
  });
};

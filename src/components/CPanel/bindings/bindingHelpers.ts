import * as THREE from 'three';
import { BindingApi } from '@tweakpane/core';
import { FolderApi, TabPageApi, BladeApi, Pane, TabApi } from 'tweakpane';
import { radToDegFormatter } from 'lib/utils/formatters';
import { getObject3DBindings } from './getBindings';
import { ParentBindings } from './ParentBindings';
import { CommonGetterParams } from './bindingTypes';
import { MaterialBindings } from './MaterialBindings';
import { animate } from 'lib/utils/animate';
import { isValidTexture } from 'lib/utils/textureUtils';
import { CustomParams, isCustomParamStruct } from 'lib/customParam.types';
import patchThree from 'lib/patchThree';

const degToRad = THREE.MathUtils.degToRad;

// helper struct to check in tests if all binding listeners have been removed
export const eventListenersMap = new Map<HTMLElement, { [key: string]: Set<(evt: any) => void> }>();

const mainTabsNames = ['Selected', 'Custom Controls', 'Global'];
const mainTabsNamesSet = new Set(mainTabsNames);

const addToEventListenerMap = (element: any, event: string, listener: (evt: any) => void) => {
  const listeners = eventListenersMap.get(element);
  const eventListeners = listeners?.[event];
  if (!listeners) {
    eventListenersMap.set(element, {});
  }
  if (!eventListeners) {
    eventListenersMap.get(element)![event] = new Set<(evt: any) => void>();
  }
  const set = eventListenersMap.get(element)?.[event];
  set?.add(listener);
};

const removeFromEventListenerMap = (element: any, event: string, listener: (evt: any) => void) => {
  eventListenersMap.get(element)?.[event]?.delete(listener);
  if (!eventListenersMap.get(element)?.[event]?.size) {
    delete (eventListenersMap.get(element) || {})[event];
  }
  const obj = eventListenersMap.get(element);
  if (obj && !Object.keys(obj).length) {
    eventListenersMap.delete(element);
  }
};

export const numberFormat = (precision: number) => (value: number) => value.toFixed(precision);

// TODO: scale these according with scene size. A scene of hundreds of units will need a different scale.
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

// hijack change event value to convert radians to degrees
export const makeRotationBinding = (binding: BindingApi) => {
  binding.controller.view.valueElement.querySelectorAll('input').forEach((input) => {
    input.addEventListener('change', rotationHandler, true);
    addToEventListenerMap(input, 'change', rotationHandler);
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

const dispatchTransitionEnd = (evt: MouseEvent) => {
  evt.currentTarget?.dispatchEvent(
    new TransitionEvent('transitionend', {
      bubbles: true,
      cancelable: true,
      propertyName: 'height'
    })
  );
  adjustCPanelWidthFromNestedExpandedFolders();
};

const memoizeExpandedState = (evt: MouseEvent) => {
  const currentTarget = evt.currentTarget as HTMLButtonElement; // this is the folderButton
  // and folderButton.parentNode is the same as folder.element;

  const isExpanded = [...(currentTarget.parentNode as HTMLElement)!.classList].some((c) => c.endsWith('expanded'));
  const folderTweakId = currentTarget.dataset.folder_id;
  // @ts-ignore
  foldersExpandedMap[folderTweakId] = isExpanded;
};

const foldersExpandedMap = {} as Record<string, boolean>;
// memoize folder expanded state
export const tweakFolder = (folder: FolderApi | TabPageApi, id: string) => {
  if (folder instanceof TabPageApi) return;

  // guard against double tweakFolder call leading to overridden memoizeExpandedState folder_id (folder.title!)
  // this happens in the last call to the tweakFolder in _buildBindings
  // which overrides prev tweakFolder calls done recursively
  if (getFolderTweakId(folder)) return;
  setFolderTweakId(folder, id);

  // apply expanded from previous state
  // matching on folderTweakID which is consistent
  if (foldersExpandedMap[id] !== undefined) {
    folder.expanded = foldersExpandedMap[id];
  } else {
    foldersExpandedMap[id] = folder.expanded;
  }

  folder.element.classList.add('folder-button');

  const folderButton = folder.element.children[0] as HTMLButtonElement;
  // Memoizing last expanded state
  folderButton.addEventListener('click', memoizeExpandedState);
  addToEventListenerMap(folderButton, 'click', memoizeExpandedState);

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
    if (anyButton.dataset.is_dispatching_transition_end === 'true') {
      // console.log('already dispatching transitionend', anyButton);
      return;
    }
    anyButton.dataset.is_dispatching_transition_end = 'true';
    // Dispatching from deepest to top.
    // The event will be handled by all interested ancestors.
    anyButton.addEventListener('click', dispatchTransitionEnd);
    addToEventListenerMap(anyButton, 'click', dispatchTransitionEnd);
  });
};

const setFolderTweakId = (folder: FolderApi, id: string) => {
  const folderButton = folder.element.children[0] as HTMLButtonElement;
  if (folderButton.dataset.folder_id) {
    return false;
  }
  folderButton.dataset.folder_id = id;
  return true;
};

const getFolderTweakId = (folder: FolderApi) => {
  const folderButton = folder.element.children[0] as HTMLButtonElement;
  return folderButton.dataset.folder_id;
};

const _buildParentBindings = (folder: FolderApi, object: any, params: CommonGetterParams) => {
  if (object.parent) {
    const parentFolder = folder.addFolder({
      title: 'Parent',
      expanded: false
    });
    const folderTweakId = `parent ${parentFolder.title!} | ${object.parent.uuid || 'no-id'}`;
    tweakFolder(parentFolder, folderTweakId);
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

  Object.keys(bindings).forEach((bindingKey) => {
    const bindingCandidate = bindings[bindingKey];
    // need to rely on init to put some dependencies on bindingCandidate (e.g. for renderTarget)
    bindingCandidate.init?.({ object, folder, bindings, params });
    const isButton = bindingCandidate.title && bindingCandidate.label;

    if (isButton) {
      if (bindingCandidate.if && !bindingCandidate.if(object)) return;
      const button = folder.addButton({
        label: bindingCandidate.label,
        title: bindingCandidate.title
      });
      button.on('click', bindingCandidate.onClick.bind(null, { object, folder, bindings }));
      tweakBindingView(button);
      return;
    }

    if (
      bindingKey === 'title' ||
      object[bindingKey] === undefined ||
      object[bindingKey] === null ||
      (object[bindingKey] instanceof THREE.Texture && !isValidTexture(object[bindingKey]))
    )
      return;

    // handle material case which can be a Material or an array of Materials
    if (Array.isArray(object[bindingKey])) {
      // We do not need a Set here because we want to show everything as is.
      object[bindingKey].forEach((item: any, index: number) => {
        const subFolder = folder.addFolder({
          title: `${bindingKey} ${index}`,
          expanded: false
        });

        try {
          _buildBindings(subFolder, item, bindingCandidate, params);
        } catch (error) {
          console.error('Error building bindings for', bindingKey, { error });
        }
      });
      return;
    }

    const isFolder = bindingCandidate.title;
    const isBinding = bindingCandidate.label;

    if (isFolder) {
      if (bindingCandidate.if && !bindingCandidate.if(object)) return;
      const subFolder = folder.addFolder({
        title: `${bindingCandidate.title}`,
        expanded: false
      });
      bindingCandidate.__parentObject = object;
      try {
        _buildBindings(subFolder, object[bindingKey], bindingCandidate, params);
      } catch (error) {
        console.error('Error building bindings for', bindingKey, {
          error,
          subFolder,
          object,
          bindingKey,
          bindingCandidate,
          params
        });
      }

      return;
    }

    if (!isBinding) return;
    if (bindingCandidate.if && !bindingCandidate.if(object)) return;
    // Forcing all pickers inline to prevent layout issues.
    // Not all bindings have pickers but there's no harm in setting it inline even if there's no picker
    bindingCandidate.picker = 'inline';

    const binding = folder.addBinding(object, bindingKey, bindingCandidate);
    // @ts-ignore
    if (object instanceof THREE.Material && object[bindingKey] instanceof THREE.Texture) {
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
    if (
      bindingCandidate.details &&
      // show details folder only if there are any details to show (scene.background can be a texture or a color, details are only for texture)
      Object.keys(bindingCandidate.details).some((detailKey) => object[bindingKey]?.[detailKey] !== undefined)
    ) {
      const uuid = object[bindingKey].uuid || 'no_uuid-x';
      const id = object[bindingKey].id || 'no_id';
      const subFolder = folder.addFolder({
        // WebGlRenderTarget does not have uuid and id // check on light.shadow.map and cubeCamera.renderTarget
        title: `${bindingCandidate.label} Details ${uuid.split('-')[0]}-${id}`,
        expanded: false
      });

      bindingCandidate.details.__parentObject = object;
      if (bindingCandidate.details.onDetailsChange) {
        // console.log('candidate.details.onChange', { 'candidate.details': bindingCandidate.details, object, 'object[key]': object[key], binding });
        subFolder.on(
          'change',
          bindingCandidate.details.onDetailsChange.bind(null, {
            object: object[bindingKey],
            folder: subFolder,
            bindings: bindingCandidate.details
          })
        );
        delete bindingCandidate.details.onDetailsChange;
      }
      try {
        _buildBindings(subFolder, object[bindingKey], bindingCandidate.details, params);
      } catch (error) {
        console.error('Error building bindings for', bindingKey, { error });
      }
    }

    tweakBindingView(binding);

    if (bindingCandidate.format === radToDegFormatter) {
      makeRotationBinding(binding);
    }
  });

  // Collecting animations
  // TODO: Later on add more capabilities to animations (blending, ...)
  if (object.animations && object.animations.length) {
    const animationsFolder = folder.addFolder({
      title: `Animations (${object.animations.length})`,
      expanded: false
    });
    const folderTweakId = `collected animations ${animationsFolder.title!} | ${object.uuid || 'no-id'}`;
    tweakFolder(animationsFolder, folderTweakId);

    const inspectorData = object.__inspectorData as THREE.Object3D['__inspectorData'];

    // reuse existing mixer and actions if available so that we can select other objects then came back to prev object and stop actions
    inspectorData.cpMixer = inspectorData.cpMixer ?? new THREE.AnimationMixer(object);
    const mixer = inspectorData.cpMixer;
    inspectorData.cpStartStop = inspectorData.cpStartStop ?? animate((delta) => mixer.update(delta), object);
    inspectorData.cpActions = inspectorData.cpActions ?? new Map(); // AnimationClip -> AnimationAction
    inspectorData.__cpCurrentPlayingAction = inspectorData.__cpCurrentPlayingAction ?? null; // just to not let it be undefined since in tests we're asserting null
    const { start, stop } = inspectorData.cpStartStop;
    const actions = inspectorData.cpActions;

    object.animations.forEach((animation: THREE.AnimationClip) => {
      const actionID = animation.name || animation.uuid;
      let action: THREE.AnimationAction;
      if (actions.has(animation)) {
        action = actions.get(animation)!;
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

  if (['Object3D', 'Camera Current', 'Scene'].includes(folder.title ?? '')) {
    folder.on('change', () => {
      if (patchThree.getThreeRootState().frameloop !== 'demand') return;
      patchThree.render();
    });
  }

  // Collecting all morph targets from all meshes grouped by name.
  // As an edge case if 2 original meshes (before optimization done by loadObject) had the same morph target name
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
      const folderTweakId = `collected morphs ${morphFolder.title!} | ${object.uuid || 'no-id'}`;
      tweakFolder(morphFolder, folderTweakId);
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
    // root object
    const materials = new Set<THREE.Material>();
    object.traverse((child: THREE.Object3D) => {
      if (child === object || child.__inspectorData.isPicker || child.__inspectorData.isHelper) return;
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
      const materialsFolderTitle = `Materials Inventory (${materialsArray.length})`;
      const materialsFolderUUID = object.uuid || 'no-id';
      const materialsFolderMapID = `collected materials ${materialsFolderTitle} | ${materialsFolderUUID}`;
      const materialsFolder = folder.addFolder({
        title: materialsFolderTitle,
        expanded: foldersExpandedMap[materialsFolderMapID] ?? false
      });
      tweakFolder(materialsFolder, materialsFolderMapID);

      const populateMaterialsFolder = () => {
        materialsArray.forEach((material, index) => {
          const materialSubfolderMapID = `material ${materialsFolderUUID} | ${material.uuid}`;
          const subFolder = materialsFolder.addFolder({
            title: material.name || `Material ${index}`,
            expanded: foldersExpandedMap[materialSubfolderMapID] ?? false
          });

          tweakFolder(subFolder, materialSubfolderMapID);

          const tryBuildBindings = () => {
            try {
              _buildBindings(subFolder, material, MaterialBindings(params), params);
            } catch (error) {
              console.error('Error building bindings for', material.name || material.uuid, { material, error });
            }
          };

          if (subFolder.expanded) {
            tryBuildBindings();
          }

          subFolder.on('fold', (evt) => {
            if (evt.expanded) {
              tryBuildBindings();
            } else {
              cleanupContainer(subFolder);
            }
          });
        });
      };

      populateMaterialsFolder();

      object.children.length &&
        folder.addBlade({
          view: 'separator'
        });
    }
  }

  // morphTargetInfluences
  if (folder.title !== 'Object3D' && Object.keys(object.morphTargetDictionary || {})?.length) {
    const morphFolder = folder.addFolder({
      title: `Morph Targets (${object.morphTargetInfluences.length})`,
      expanded: false
    });
    const folderTweakId = `morphs ${morphFolder.title!} | ${object.uuid || 'no-id'}`;
    tweakFolder(morphFolder, folderTweakId);
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
      : object.children
          ?.map((child: any) => !child.__inspectorData.isPicker && !child.__inspectorData.isHelper && child)
          .filter(Boolean) || [];
  if (objectChildren.length) {
    const childrenFolder = folder.addFolder({
      title: `Children (${objectChildren.length})`,
      expanded: false
    });
    const folderTweakId = `children ${childrenFolder.title!} | ${object.uuid || 'no-id'}`;
    tweakFolder(childrenFolder, folderTweakId);

    objectChildren.forEach(function (child: any) {
      const childFolderTitle = child.name || child.uuid;
      const childFolderUUID = child.uuid || 'no-id';
      const childMapID = `child ${childFolderTitle} | ${childFolderUUID}`;
      const childFolder = childrenFolder.addFolder({
        title: childFolderTitle,
        expanded: foldersExpandedMap[childMapID] ?? false
      });
      tweakFolder(childFolder, childMapID);

      const populateChildFolder = () => {
        try {
          const newBindings = getObject3DBindings(params);
          _buildBindings(childFolder, child, newBindings, params);
        } catch (error) {
          console.error('Error building bindings for', childFolderTitle, { error });
        }
      };

      if (childFolder.expanded) {
        populateChildFolder();
      }

      childFolder.on('fold', (evt) => {
        if (evt.expanded) {
          populateChildFolder();
        } else {
          cleanupContainer(childFolder);
        }
      });
    });
  }

  // Using it at the end so that inside tweakFolder()
  // we can access all buttons added so far by inner folders.
  // Note: this folder might have already been tweaked
  // if tweakFolder was called along with _buildBindings recursively
  // In that case this tweakFolder is ignored.
  const folderTweakId = `folder ${folder.title!} | ${object.uuid || 'no-id'}`;
  tweakFolder(folder, folderTweakId);
};

export const buildBindings = (folder: FolderApi, object: any, bindings: any, params: CommonGetterParams) => {
  try {
    return _buildBindings(folder, object, bindings, params);
  } catch (error) {
    console.error('Error building bindings', { folder, object, bindings, error });
  }
};

export const buildCustomParams = ({
  cPanelCustomParams,
  customParamsTab,
  nesting = 0
}: {
  cPanelCustomParams: CustomParams;
  customParamsTab: TabPageApi;
  nesting?: number;
}) => {
  Object.keys(cPanelCustomParams).forEach((controlName) => {
    if (!isCustomParamStruct(cPanelCustomParams[controlName])) {
      const folder = customParamsTab.addFolder({
        title: controlName,
        expanded: nesting === 0
      });
      buildCustomParams({
        cPanelCustomParams: cPanelCustomParams[controlName],
        // @ts-ignore
        customParamsTab: folder,
        nesting: nesting + 1
      });
      const folderTweakId = `folder custom control ${controlName} | (${nesting})`;
      tweakFolder(folder, folderTweakId);
    } else {
      const paramStruct = cPanelCustomParams[controlName];
      const { object, prop, control } = paramStruct;
      const isButton = typeof control?.onClick === 'function';

      // Forcing all pickers inline to prevent layout issues.
      // Not all bindings have pickers but there's no harm in setting it inline even if there's no picker
      control.picker = 'inline';
      try {
        let binding;
        if (isButton) {
          if (control.view === 'buttongrid') {
            // @ts-ignore
            binding = customParamsTab.addBlade(control).on('click', (evt) => {
              control.onClick?.({ title: evt.cell.title, index: evt.index });
            });
          } else {
            // @ts-ignore
            binding = customParamsTab.addButton(control).on('click', () => {
              control.onClick?.(control);
            });
          }
        } else {
          if (control.view === 'cubicbezier') {
            // @ts-ignore
            binding = customParamsTab.addBlade(control).on('change', (evt) => {
              control.onChange?.({ x1: evt.value.x1, x2: evt.value.x2, y1: evt.value.y1, y2: evt.value.y2 });
            });
          } else {
            binding = customParamsTab.addBinding(object!, prop!, control).on('change', (evt) => {
              control.onChange?.(evt.value, object, prop);
            });
          }
        }

        tweakBindingView(binding);

        if (control.format === radToDegFormatter) {
          makeRotationBinding(binding as BindingApi);
        }
      } catch (err) {
        console.error('Error building bindings for', controlName, err);
      }
    }
  });
};

// cleanupContainer is also called internally in bindingHelpers without the need to disposeRootFolder
export const cleanupContainer = (node: any, options: { disposeRootFolder?: boolean; _isRootFolder?: boolean } = {}) => {
  // console.log('cleanupContainer', node.title ? `folder ${node.title}` : `binding ${node.key}`);

  const { disposeRootFolder = false, _isRootFolder = true } = options;
  if ((!_isRootFolder || disposeRootFolder) && node.element.classList.contains('folder-button')) {
    node.element.children[0].removeEventListener('click', memoizeExpandedState); // the folder button
    removeFromEventListenerMap(node.element.children[0], 'click', memoizeExpandedState);
  }
  node.element.querySelectorAll('button').forEach((button: any) => {
    // all descendant buttons in folder
    button.removeEventListener('click', dispatchTransitionEnd);
    removeFromEventListenerMap(button, 'click', dispatchTransitionEnd);
  });
  node.element.querySelectorAll('input').forEach((input: any) => {
    input.removeEventListener('change', rotationHandler, true);
    removeFromEventListenerMap(input, 'change', rotationHandler);
  });

  if (!node.children) {
    // this case is only if the root node is a binding
    // (not a real scenario, we're passing always a folder in practice)
    node.dispose();
    node.parent?.remove(node);
    return;
  }

  node.children.forEach((child: any) => {
    // Note: a child can be a folder or a binding
    // Note: bindings do not have children while folders and tabs do
    cleanupContainer(child, { ...options, _isRootFolder: false });
    child.dispose(); // prevent mem leak
    node.remove(child);
  });

  // this is basically for the folder in the initial cleanupContainer call
  if (disposeRootFolder && _isRootFolder && !mainTabsNamesSet.has(node.title)) {
    node.dispose(); // e.g. disposing of .on('fold')
  }
};

export const getPaneTab = (pane: Pane, tabIndex: number) => {
  return (pane.children[0] as TabApi).pages[tabIndex];
};

export const setSelectedTab = (pane: Pane, tabIndex: number) => {
  pane.children[0].element.children[0].children[tabIndex].children[0].dispatchEvent(new Event('click'));
};

import { degToRad, focusCamera, radToDegFormatter } from 'lib/utils';
import * as THREE from 'three';
import { BladeApi, FolderApi, TabPageApi } from 'tweakpane';
import { BindingApi } from '@tweakpane/core';
import { useAppStore } from 'src/store';

export function rotationHandler(this: HTMLInputElement, e: Event) {
  // @ts-ignore
  e.target.value = +degToRad(e.target.value);
}

export const makeRotationBinding = (binding: BindingApi) => {
  binding.controller.view.valueElement
    .querySelectorAll('input')
    .forEach((input) => {
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
    foldersExpandedMap[id] = !!folder.expanded;
  }
  folder.element.classList.add('folder-button');
  const folderButton = folder.element.children[0];

  // Memoizing last expanded state
  folderButton.addEventListener('click', () => {
    const isExpanded = [
      ...(folderButton.parentNode as HTMLElement)!.classList
    ].some((c) => c.endsWith('expanded'));
    foldersExpandedMap[id] = !!isExpanded;
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
    });
  });
};

export const numberCommon = {
  keyScale: 0.1,
  pointerScale: 0.01,
  format: (value: number) => value.toFixed(2)
};

const ObjectStoreBindings = () => ({
  transformControlsMode: {
    label: 'TMode ( ,./ )',
    view: 'radiogrid',
    groupName: 'transformControlsMode',
    size: [3, 1],
    cells: (x: number, _y: number) => ({
      title: x === 0 ? 'Translate' : x === 1 ? 'Rotate' : 'Scale',
      value: x === 0 ? 'translate' : x === 1 ? 'rotate' : 'scale'
    }),
    onChange: (_object: any, mode: any) => {
      useAppStore.getState().setTransformControlsMode(mode.value);
    }
  },
  transformControlsSpace: {
    label: "TSpace ( ;' )",
    view: 'radiogrid',
    groupName: 'transformControlsSpace',
    size: [2, 1],
    cells: (x: number, _y: number) => ({
      title: x === 0 ? 'World' : 'Local',
      value: x === 0 ? 'world' : 'local'
    }),
    onChange: (_object: any, space: any) => {
      useAppStore.getState().setTransformControlsSpace(space.value);
    }
  }
});

const Object3DBindings = ({ angleFormat }: CommonGetterParams) => ({
  uuid: {
    label: 'UUID',
    view: 'text',
    disabled: true
  },
  name: {
    label: 'Name',
    view: 'text',
    disabled: true
  },
  type: {
    label: 'Type',
    view: 'text',
    disabled: true
  },
  position: {
    label: 'Position(L)',
    ...numberCommon
  },
  rotation: {
    label: `Rotation(${angleFormat})(L)`,
    ...numberCommon,
    ...(angleFormat === 'deg' ? { format: radToDegFormatter } : {})
  },
  quaternion: {
    label: `Quaternion(${angleFormat})(L)`,
    ...numberCommon,
    ...(angleFormat === 'deg' ? { format: radToDegFormatter } : {})
  },
  scale: {
    label: 'Scale(L)',
    ...numberCommon
  },
  up: {
    label: 'Up',
    ...numberCommon
  },
  castShadow: {
    label: 'Cast Shadow',
    view: 'toggle'
  },
  receiveShadow: {
    label: 'Receive Shadow',
    view: 'toggle'
  },
  visible: {
    label: 'Visible',
    view: 'toggle'
  }
});

const MaterialBindings = () => ({
  wireframe: {
    label: 'Wireframe',
    view: 'toggle'
  },
  transparent: {
    label: 'Transparent',
    view: 'toggle'
  },
  alphaHash: {
    label: 'Alpha Hash',
    view: 'toggle'
  },
  alphaTest: {
    label: 'Alpha Test',
    min: 0,
    max: 1,
    ...numberCommon
  },
  opacity: {
    label: 'Opacity',
    min: 0,
    max: 1,
    ...numberCommon
  },
  visible: {
    label: 'Visible',
    view: 'toggle'
  },
  dithering: {
    label: 'Dithering',
    view: 'toggle'
  },
  side: {
    label: 'Side',
    options: {
      Front: THREE.FrontSide,
      Back: THREE.BackSide,
      Double: THREE.DoubleSide
    }
  },
  vertexColors: {
    label: 'Vertex Colors',
    view: 'toggle'
  },
  fog: {
    label: 'Fog',
    view: 'toggle'
  },
  color: {
    label: 'Color',
    color: { type: 'float' },
    view: 'color'
  },
  emissive: {
    label: 'Emissive',
    color: { type: 'float' },
    view: 'color'
  },
  emissiveIntensity: {
    label: 'Emissive Intensity',
    min: 0,
    ...numberCommon
  },
  lightMapIntensity: {
    label: 'Light Map Intensity',
    min: 0,
    ...numberCommon
  },
  sizeAttenuation: {
    label: 'Size Attenuation',
    view: 'toggle'
  },
  lineWidth: {
    label: 'Line Width',
    ...numberCommon
  },
  lineCap: {
    label: 'Line Cap',
    options: {
      Butt: 'butt',
      Round: 'round',
      Square: 'square'
    }
  },
  lineJoin: {
    label: 'Line Join',
    options: {
      Bevel: 'bevel',
      Round: 'round',
      Miter: 'miter'
    }
  },
  dashSize: {
    label: 'Dash Size',
    ...numberCommon
  },
  gapSize: {
    label: 'Gap Size',
    ...numberCommon
  },
  scale: {
    label: 'Scale',
    ...numberCommon
  },
  bumpScale: {
    label: 'Bump Scale',
    min: 0,
    max: 1,
    ...numberCommon
  },
  displacementScale: {
    label: 'Displacement Scale',
    ...numberCommon
  },
  displacementBias: {
    label: 'Displacement Bias',
    ...numberCommon
  }
});

const LightBindings = () => ({
  intensity: {
    label: 'Intensity',
    min: 0,
    ...numberCommon
  },
  power: {
    label: 'Power',
    min: 0,
    ...numberCommon
  },
  color: {
    label: 'Color',
    color: { type: 'float' },
    view: 'color'
  },
  groundColor: {
    // for hemisphere light
    label: 'Ground Color',
    color: { type: 'float' },
    view: 'color'
  },
  decay: {
    label: 'Decay',
    min: 0,
    ...numberCommon
  },
  distance: {
    label: 'Distance',
    min: 0,
    ...numberCommon
  },
  angle: {
    label: 'Angle',
    min: 0,
    max: Math.PI / 2,
    ...numberCommon
  },
  penumbra: {
    // SpotLight
    label: 'Penumbra',
    min: 0,
    max: 1,
    ...numberCommon
  },
  width: {
    // RectAreaLight
    label: 'Width',
    ...numberCommon
  },
  height: {
    // RectAreaLight
    label: 'Height',
    ...numberCommon
  }
});

const LightShadowBindings = () => ({
  mapSize: {
    label: 'MapSize',
    step: 1,
    onChange: (object: any) => {
      if (object.__parent?.shadow?.map) {
        object.__parent.shadow.map.dispose();
        object.__parent.shadow.map = null;
      }
    }
  },
  radius: {
    label: 'Radius',
    min: 0
  },
  blurSamples: {
    label: 'Blur Samples',
    step: 1,
    min: 0
  },
  bias: {
    label: 'Bias',
    step: 0.0001
  },
  normalBias: {
    label: 'Normal bias',
    step: 1
  }
});

const PerspectiveCameraBindings = () => ({
  aspect: {
    label: 'Aspect',
    ...numberCommon
  },
  fov: {
    label: 'FOV',
    ...numberCommon
  },
  filmGauge: {
    label: 'Film Gauge',
    ...numberCommon
  },
  filmOffset: {
    label: 'Film Offset',
    ...numberCommon
  }
});
const OrthographicCameraBindings = () => ({
  left: {
    label: 'Left',
    ...numberCommon
  },
  right: {
    label: 'Right',
    ...numberCommon
  },
  top: {
    label: 'Top',
    ...numberCommon
  },
  bottom: {
    label: 'Bottom',
    ...numberCommon
  }
});

export const CameraBindings = () => ({
  near: {
    label: 'Near',
    ...numberCommon,
    min: 0
  },
  far: {
    label: 'Far',
    ...numberCommon
  },
  zoom: {
    label: 'Zoom',
    ...numberCommon,
    min: 0
  },
  ...PerspectiveCameraBindings(),
  ...OrthographicCameraBindings()
});

export const RendererInfoMemoryBindings = () => ({
  geometries: {
    label: 'Geometries',
    disabled: true
  },
  textures: {
    label: 'Textures',
    disabled: true
  }
});

export const RendererInfoRenderBindings = () => ({
  calls: {
    label: 'Calls',
    disabled: true
  },
  triangles: {
    label: 'Triangles',
    disabled: true
  },
  points: {
    label: 'Points',
    disabled: true
  },
  lines: {
    label: 'Lines',
    disabled: true
  },
  frame: {
    label: 'Frame',
    disabled: true
  }
});

export const RendererBindings = () => ({
  toneMapping: {
    label: 'Tone Mapping',
    options: {
      None: THREE.NoToneMapping,
      Linear: THREE.LinearToneMapping,
      Reinhard: THREE.ReinhardToneMapping,
      Cineon: THREE.CineonToneMapping,
      ACESFilmic: THREE.ACESFilmicToneMapping,
      AGX: THREE.AgXToneMapping,
      Neutral: THREE.NeutralToneMapping,
      Custom: THREE.CustomToneMapping
    }
  }
});

export const RendererShadowMapBindings = () => ({
  type: {
    label: 'Type',
    options: {
      Basic: THREE.BasicShadowMap,
      Percentage: THREE.PCFShadowMap,
      Soft: THREE.PCFSoftShadowMap,
      Variance: THREE.VSMShadowMap
    },
    onChange: (object: any) => {
      const scene = object.__sceneObjects.scene;
      scene.traverse((child: any) => {
        if (child instanceof THREE.Mesh && child.material)
          child.material.needsUpdate = true;
      });
    }
  }
});

export const PaneBindings = () => ({
  cPanelContinuousUpdate: {
    label: 'Continuous Update ( U )',
    onChange: (_object: any, continuousUpdate: any) => {
      useAppStore.getState().setCPanelContinuousUpdate(continuousUpdate.value);
    }
  },
  angleFormat: {
    label: 'Angle Format ( [ )',
    view: 'radiogrid',
    groupName: 'angleFormat',
    size: [2, 1],
    cells: (x: number, _y: number) => ({
      title: x === 0 ? 'Deg' : 'Rad',
      value: x === 0 ? 'deg' : 'rad'
    }),
    onChange: (_object: any, angleFormat: any) => {
      useAppStore.getState().setAngleFormat(angleFormat.value);
    }
  }
});

export const CameraStoreBindings = () => ({
  cameraControl: {
    label: 'Control ( N )',
    view: 'radiogrid',
    groupName: 'cameraControl',
    size: [2, 1],
    cells: (x: number, _y: number) => ({
      title: x === 0 ? 'Orbit' : 'Fly',
      value: x === 0 ? 'orbit' : 'fly'
    }),
    onChange: (_object: any, cameraControl: any) => {
      useAppStore.getState().setCameraControl(cameraControl.value);
    }
  },
  cameraType: {
    label: 'Type ( C )',
    view: 'radiogrid',
    groupName: 'cameraType',
    size: [2, 1],
    cells: (x: number, _y: number) => ({
      title: x === 0 ? 'Perspective' : 'Orthographic',
      value: x === 0 ? 'perspective' : 'orthographic'
    }),
    onChange: (_object: any, cameraType: any) => {
      useAppStore.getState().setCameraType(cameraType.value);
    }
  },
  attachDefaultControllersToPlayingCamera: {
    label: 'Attach default controllers when Playing custom camera ( ] )',
    view: 'toggle',
    onChange: (_object: any, evt: any) => {
      useAppStore
        .getState()
        .setAttachDefaultControllersToPlayingCamera(evt.value);
    }
  }
});

export const SceneButtons = ({ isPlaying }: CommonGetterParams) => [
  {
    label: 'Full Screen Toggle( \\ | F11(native) )',
    title: 'Toggle Full Screen',
    onClick: (_sceneObjects: SceneObjects) => {
      useAppStore.getState().toggleFullscreen();
    }
  },
  {
    label: 'Focus Camera ( F )',
    title: 'Focus Selected Object',
    onClick: ({ scene, camera }: SceneObjects) => {
      focusCamera({
        camera,
        // @ts-ignore
        orbitControls: scene.orbitControlsRef.current,
        // @ts-ignore
        transformControls: scene.transformControlsRef.current
      });
    }
  },
  {
    label: 'Show Helpers ( CAS+H )',
    title: 'Toggle Helpers',
    onClick: (_sceneObjects: SceneObjects) => {
      useAppStore.getState().toggleShowHelpers();
    }
  },
  {
    label: 'Show Gizmos ( CAS+G )',
    title: 'Toggle Gizmos',
    onClick: (_sceneObjects: SceneObjects) => {
      useAppStore.getState().toggleShowGizmos();
    }
  },
  {
    label: 'Play/Stop ( Space|CAS+Space )',
    title: isPlaying ? 'Stop' : 'Play',
    onClick: (_sceneObjects: SceneObjects) => {
      useAppStore.getState().togglePlaying();
    }
    // label: 'Play State ( Space|CAS+Space )',
    // view: 'radiogrid',
    // groupName: 'playState',
    // size: [2, 1],
    // cells: (x: number, _y: number) => ({
    //   title: x === 0 ? 'Play' : 'Stop',
    //   value: x === 0 ? false : true
    // }),
    // onChange: (_object: any, playState: any) => {
    //   useAppStore.getState().setPlaying(playState.value);
    // }
  }
];

export const RaycasterParamsLineBindings = () => ({
  threshold: {
    label: 'Threshold',
    ...numberCommon,
    min: 0
  }
});
export const RaycasterParamsPointsBindings = () => ({
  threshold: {
    label: 'Threshold',
    ...numberCommon,
    min: 0
  }
});

export const getObjectsStoreBindings = () => ({
  ...ObjectStoreBindings()
});

export const getObject3DBindings = (params: CommonGetterParams) => ({
  ...Object3DBindings(params),
  ...CameraBindings(),
  ...LightBindings(),
  shadow: {
    // Some lights have shadow
    title: 'Shadow',
    ...LightShadowBindings(),
    camera: {
      title: 'Camera',
      ...CameraBindings()
    }
  },
  target: {
    // DirectionalLight, SpotLight
    title: 'Target',
    position: {
      label: 'Position',
      ...numberCommon
    }
  },
  material: {
    // Mesh
    title: 'Material',
    ...MaterialBindings()
  },
  parent: {
    // Object3D
    title: 'Parent',
    uuid: {
      label: 'UUID',
      view: 'text',
      disabled: true
    },
    name: {
      label: 'Name',
      view: 'text',
      disabled: true
    },
    type: {
      label: 'Type',
      view: 'text',
      disabled: true
    }
  }
});

export const getRendererBindings = () => ({
  ...RendererBindings(),
  shadowMap: {
    title: 'Shadow Map',
    ...RendererShadowMapBindings()
  },
  info: {
    title: 'Info',
    memory: {
      title: 'Memory (Geometries,Textures)',
      ...RendererInfoMemoryBindings()
    },
    render: {
      title: 'Render (Calls,Tris,Pnts,Lns,Frm)',
      ...RendererInfoRenderBindings()
    }
  }
});

export const getPaneBindings = () => ({
  ...PaneBindings()
});

export const getCameraStoreBindings = () => ({
  ...CameraStoreBindings()
});

export const getSceneButtons = ({ isPlaying }: CommonGetterParams) => [
  ...SceneButtons({ isPlaying })
];

export const getRaycasterParamsBindings = () => ({
  params: {
    title: 'Params',
    Line: {
      title: 'Line',
      ...RaycasterParamsLineBindings()
    },
    Points: {
      title: 'Points',
      ...RaycasterParamsPointsBindings()
    }
  }
});

type SceneObjects = {
  scene: THREE.Scene;
  camera: THREE.Camera;
};

type CommonGetterParams = {
  angleFormat?: 'deg' | 'rad';
  isPlaying?: boolean;
};

export const buildBindings = (
  folder: FolderApi,
  object: any,
  bindings: any,
  sceneObjects: SceneObjects
) => {
  Object.keys(bindings).forEach((key) => {
    if (key === 'title' || object[key] === undefined || object[key] === null)
      return;

    const candidate = bindings[key];
    const isFolder = candidate.title;
    const isBinding = candidate.label;
    if (isFolder) {
      const subFolder = folder.addFolder({
        title: candidate.title,
        expanded: false
      });
      object[key].__parent = object;
      object[key].__sceneObjects = sceneObjects;
      buildBindings(subFolder, object[key], candidate, sceneObjects);
      return;
    }
    if (!isBinding) return;
    // Forcing all pickers inline to prevent layout issues.
    // Not all bindings have pickers but there's no harm in setting it inline even if there's no picker
    candidate.picker = 'inline';
    const binding = folder.addBinding(object, key, candidate);
    if (candidate.onChange) {
      binding.on('change', candidate.onChange.bind(null, object));
    }
    tweakBindingView(binding);
    if (candidate.format === radToDegFormatter) {
      makeRotationBinding(binding);
    }
  });
  // Using it at the end so that inside tweakFolder()
  // we can access all buttons added so far by inner folders.
  tweakFolder(folder, `${folder.title!}-${object.uuid || 'no-id'}`);
};

export const buildButtons = (
  folder: FolderApi,
  configs: {
    title: string;
    label: string;
    onClick: (sceneObjects: SceneObjects) => void;
  }[],
  sceneObjects: SceneObjects
) => {
  tweakFolder(folder, folder.title!);
  configs.forEach((config) => {
    const button = folder.addButton({
      label: config.label,
      title: config.title
    });
    tweakBindingView(button);
    button.on('click', config.onClick.bind(null, sceneObjects));
  });
};

export const cleanupContainer = (container: any) => {
  if (!container.children) return;
  container.children.forEach((child: any) => {
    cleanupContainer(child);
    // console.log(
    //   'cleanupContainer',
    //   child.title ? `folder ${child.title}` : `binding ${child.key}`
    // );
    container.remove(child);
  });
};

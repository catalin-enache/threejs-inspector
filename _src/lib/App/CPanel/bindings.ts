import { degToRad, focusCamera, radToDegFormatter } from 'lib/utils';
import * as THREE from 'three';
import { BladeApi, FolderApi } from 'tweakpane';
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
  const view = binding.controller.view as any;
  view.labelElement.classList.add('binding-label');
  view.labelElement.title = view.labelElement.textContent!;
  view.valueElement.classList.add('binding-value');
  return binding;
};

const foldersExpandedMap = {} as Record<string, boolean>;

// memoize folder expanded state
export const tweakFolder = (folder: FolderApi, id: string) => {
  if (foldersExpandedMap[id] !== undefined) {
    folder.expanded = foldersExpandedMap[id];
  } else {
    foldersExpandedMap[id] = !!folder.expanded;
  }
  const button = folder.element.children[0];
  (button.parentNode as HTMLElement)!.classList.add('folder-button');
  button.addEventListener('click', () => {
    const isExpanded = [...(button.parentNode as HTMLElement)!.classList].some(
      (c) => c.endsWith('expanded')
    );
    foldersExpandedMap[id] = !!isExpanded;
    // Make Tweakpane believe there was a transition event, since it seems it relies on it
    folder.element.dispatchEvent(
      new TransitionEvent('transitionend', {
        bubbles: true,
        cancelable: true,
        propertyName: 'height'
      })
    );
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
    options: {
      Translate: 'translate',
      Rotate: 'rotate',
      Scale: 'scale'
    },
    onChange: (_object: any, mode: any) => {
      useAppStore.getState().setTransformControlsMode(mode.value);
    }
  },
  transformControlsSpace: {
    label: "TSpace ( ;' )",
    options: {
      World: 'world',
      Local: 'local'
    },
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
    options: {
      Deg: 'deg',
      Rad: 'rad'
    },
    onChange: (_object: any, angleFormat: any) => {
      useAppStore.getState().setAngleFormat(angleFormat.value);
    }
  }
});

export const CameraStoreBindings = () => ({
  cameraControl: {
    label: 'Control ( N )',
    options: {
      Orbit: 'orbit',
      Fly: 'fly'
    },
    onChange: (_object: any, control: any) => {
      useAppStore.getState().setCameraControl(control.value);
    }
  },
  cameraType: {
    label: 'Type ( C )',
    options: {
      Perspective: 'perspective',
      Orthographic: 'orthographic'
    },
    onChange: (_object: any, type: any) => {
      useAppStore.getState().setCameraType(type.value);
    }
  },
  attachDefaultControllersToPlayingCamera: {
    label: 'Attach default controllers when Playing ( ] )',
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
  tweakFolder(folder, `${folder.title!}-${object.uuid || 'no-id'}`);
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
    const binding = folder.addBinding(object, key, candidate);
    if (candidate.onChange) {
      binding.on('change', candidate.onChange.bind(null, object));
    }
    tweakBindingView(binding);
    if (candidate.format === radToDegFormatter) {
      makeRotationBinding(binding);
    }
  });
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

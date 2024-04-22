import { degToRad, focusCamera, radToDegFormatter } from 'lib/utils';
import * as THREE from 'three';
import { BladeApi, FolderApi, TabPageApi } from 'tweakpane';
import { BindingApi } from '@tweakpane/core';
import { useAppStore } from 'src/store';

type onChange = (
  {
    object,
    folder,
    bindings,
    sceneObjects
  }: {
    object: any;
    folder: FolderApi;
    bindings: any;
    sceneObjects: SceneObjects;
  },
  evt: { value: any }
) => void;

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

const numberFormat = (precision: number) => (value: number) =>
  value.toFixed(precision);

export const numberCommon = {
  keyScale: 0.1,
  pointerScale: 0.001,
  // Note: this step might be doing scene flickering if not enough precision
  // (3 decimals should be enough precision)
  step: 0.001,
  format: numberFormat(3)
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
    onChange: ((_, evt: any) => {
      useAppStore.getState().setTransformControlsMode(evt.value);
    }) as onChange
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
    onChange: ((_, space) => {
      useAppStore.getState().setTransformControlsSpace(space.value);
    }) as onChange
  }
});

const TextureBindings = (params: CommonGetterParams) => ({
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
  anisotropy: {
    label: 'Anisotropy',
    options: {
      1: 1,
      2: 2,
      4: 4,
      8: 8,
      16: 16
    }
  },
  format: {
    label: 'Format',
    options: {
      AlphaFormat: THREE.AlphaFormat,
      RedFormat: THREE.RedFormat,
      RedIntegerFormat: THREE.RedIntegerFormat,
      RGFormat: THREE.RGFormat,
      RGIntegerFormat: THREE.RGIntegerFormat,
      RGBAFormat: THREE.RGBAFormat,
      RGBAIntegerFormat: THREE.RGBAIntegerFormat,
      LuminanceFormat: THREE.LuminanceFormat,
      LuminanceAlphaFormat: THREE.LuminanceAlphaFormat,
      DepthFormat: THREE.DepthFormat,
      DepthStencilFormat: THREE.DepthStencilFormat
    }
  },
  type: {
    label: 'Type',
    options: {
      UnsignedByteType: THREE.UnsignedByteType,
      ByteType: THREE.ByteType,
      ShortType: THREE.ShortType,
      UnsignedShortType: THREE.UnsignedShortType,
      IntType: THREE.IntType,
      UnsignedIntType: THREE.UnsignedIntType,
      FloatType: THREE.FloatType,
      HalfFloatType: THREE.HalfFloatType,
      UnsignedShort4444Type: THREE.UnsignedShort4444Type,
      UnsignedShort5551Type: THREE.UnsignedShort5551Type,
      UnsignedInt248Type: THREE.UnsignedInt248Type
    }
  },
  internalFormat: {
    label: 'Internal Format',
    disabled: true
  },
  mapping: {
    label: 'Mapping',
    options: {
      UVMapping: THREE.UVMapping,
      CubeReflectionMapping: THREE.CubeReflectionMapping,
      CubeRefractionMapping: THREE.CubeRefractionMapping,
      EquirectangularReflectionMapping: THREE.EquirectangularReflectionMapping,
      EquirectangularRefractionMapping: THREE.EquirectangularRefractionMapping,
      CubeUVReflectionMapping: THREE.CubeUVReflectionMapping
    }
  },
  channel: {
    label: 'UV Channel',
    ...numberCommon,
    step: 1,
    min: 0,
    max: 3
  },
  wrapS: {
    label: 'Wrap S',
    options: {
      ClampToEdgeWrapping: THREE.ClampToEdgeWrapping,
      RepeatWrapping: THREE.RepeatWrapping,
      MirroredRepeatWrapping: THREE.MirroredRepeatWrapping
    }
  },
  wrapT: {
    label: 'Wrap T',
    options: {
      ClampToEdgeWrapping: THREE.ClampToEdgeWrapping,
      RepeatWrapping: THREE.RepeatWrapping,
      MirroredRepeatWrapping: THREE.MirroredRepeatWrapping
    }
  },
  offset: {
    label: 'Offset',
    ...numberCommon
  },
  repeat: {
    label: 'Repeat',
    ...numberCommon
  },
  rotation: {
    label: `Rotation ${params.angleFormat}`,
    ...numberCommon,
    ...(params.angleFormat === 'deg' ? { format: radToDegFormatter } : {})
  },
  center: {
    label: 'Center',
    ...numberCommon
  },
  generateMipmaps: {
    label: 'Generate MipMaps'
  },
  magFilter: {
    label: 'Mag Filter',
    options: {
      NearestFilter: THREE.NearestFilter,
      LinearFilter: THREE.LinearFilter
    }
  },
  minFilter: {
    label: 'Min Filter',
    options: {
      NearestFilter: THREE.NearestFilter,
      LinearFilter: THREE.LinearFilter,
      NearestMipmapNearestFilter: THREE.NearestMipmapNearestFilter,
      NearestMipmapLinearFilter: THREE.NearestMipmapLinearFilter,
      LinearMipmapNearestFilter: THREE.LinearMipmapNearestFilter,
      LinearMipmapLinearFilter: THREE.LinearMipmapLinearFilter
    }
  },
  premultiplyAlpha: {
    label: 'Premultiply Alpha'
  },
  flipY: {
    label: 'Flip Y'
  },
  unpackAlignment: {
    label: 'Unpack Alignment',
    options: {
      1: 1,
      2: 2,
      4: 4,
      8: 8
    }
  },
  colorSpace: {
    label: 'Color Space',
    options: {
      NoColorSpace: THREE.NoColorSpace,
      SRGBColorSpace: THREE.SRGBColorSpace,
      LinearSRGBColorSpace: THREE.LinearSRGBColorSpace
    }
  },
  onDetailsChange: (texture: THREE.Texture) => {
    // console.log('texture changed', texture);
    // some props won't be reflected without needsUpdate = true
    // this is not only for the image but for other props (e.g. flipY, ...)
    texture.needsUpdate = true;
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
  // quaternion is not displayed because it interferes with rotation when cPanel updates
  // TODO: make a text plugin that only reads
  // quaternion: {
  //   label: `Quaternion(${angleFormat})(L)`,
  //   ...numberCommon,
  //   ...(angleFormat === 'deg' ? { format: radToDegFormatter } : {})
  //   disabled: true
  // },
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

const MaterialBindings = (params: CommonGetterParams) => ({
  // TODO: add a general needsUpdate on any material change
  // TODO: add the rest of material props
  // TODO: Add: a way to show userData
  map: {
    label: 'Map',
    details: {
      ...TextureBindings(params)
    },
    onChange: (({ object, folder, bindings, sceneObjects }) => {
      // prettier-ignore
      // console.log('map material changed', { object, folder, bindings, sceneObjects });
      (object as THREE.Texture).needsUpdate = true;
      setTimeout(() => {
        // under setTimeout to prevent Teakpane to throw TpError.alreadyDisposed()
        cleanupContainer(folder);
        buildBindings(folder, object, bindings, sceneObjects);
      });
    }) as onChange
  },
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
  alphaToCoverage: {
    label: 'Alpha to coverage'
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
    // TODO: maybe get rid of __parent, __sceneObjects
    onChange: (({ object }) => {
      if (object.__parent?.shadow?.map) {
        object.__parent.shadow.map.dispose();
        object.__parent.shadow.map = null;
      }
    }) as onChange
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
    onChange: (({ object }) => {
      const scene = object.__sceneObjects.scene;
      scene.traverse((child: any) => {
        if (child instanceof THREE.Mesh && child.material)
          child.material.needsUpdate = true;
      });
    }) as onChange
  }
});

export const PaneBindings = () => ({
  cPanelContinuousUpdate: {
    label: 'Continuous Update ( U )',
    onChange: ((_, evt) => {
      useAppStore.getState().setCPanelContinuousUpdate(evt.value);
    }) as onChange
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
    onChange: ((_, evt: any) => {
      useAppStore.getState().setAngleFormat(evt.value);
    }) as onChange
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
    onChange: ((_, evt: any) => {
      useAppStore.getState().setCameraControl(evt.value);
    }) as onChange
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
    onChange: ((_, evt: any) => {
      useAppStore.getState().setCameraType(evt.value);
    }) as onChange
  },
  attachDefaultControllersToPlayingCamera: {
    label: 'Attach default controllers when Playing custom camera ( ] )',
    view: 'toggle',
    onChange: ((_, evt) => {
      useAppStore
        .getState()
        .setAttachDefaultControllersToPlayingCamera(evt.value);
    }) as onChange
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
    // TODO: we need play/pause/stop state
    // label: 'Play State ( Space|CAS+Space )',
    // view: 'radiogrid',
    // groupName: 'playState',
    // size: [2, 1],
    // cells: (x: number, _y: number) => ({
    //   title: x === 0 ? 'Play' : 'Stop',
    //   value: x === 0 ? false : true
    // }),
    // onChange: ((_, evt) => {
    //   useAppStore.getState().setPlaying(evt.value);
    // }) as onChange
  }
];

export const SceneConfigBindings = (params: CommonGetterParams) => ({
  background: {
    label: 'Background',
    color: { type: 'float' },
    details: {
      ...TextureBindings(params)
    },
    onChange: (({ object, folder, bindings, sceneObjects }) => {
      // prettier-ignore
      // console.log('background material changed', { object, folder, bindings, sceneObjects });
      // object is Scene here (not a Material that needsUpdate)
      setTimeout(() => {
        // under setTimeout to prevent Teakpane to throw TpError.alreadyDisposed()
        cleanupContainer(folder);
        buildBindings(folder, object, bindings, sceneObjects);
      }, 0);
    }) as onChange
  },
  backgroundBlurriness: {
    label: 'BG Blurriness',
    ...numberCommon,
    min: 0,
    max: 1
  },
  backgroundIntensity: {
    label: 'BG Intensity',
    ...numberCommon,
    min: 0
  },
  backgroundRotation: {
    label: `BG Rotation(${params.angleFormat})`,
    ...numberCommon,
    ...(params.angleFormat === 'deg' ? { format: radToDegFormatter } : {})
  }
});

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
    // for DirectionalLight, SpotLight
    title: 'Target',
    position: {
      label: 'Position',
      ...numberCommon
    }
  },
  material: {
    // for Mesh
    title: 'Material',
    ...MaterialBindings(params)
  },
  parent: {
    // for Object3D
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

export const getSceneConfigBindings = ({
  angleFormat
}: CommonGetterParams) => ({
  ...SceneConfigBindings({ angleFormat })
});

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
  gl: THREE.WebGLRenderer;
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
  // console.log('buildBindings for', folder.title, { object, bindings });
  Object.keys(bindings).forEach((key) => {
    if (key === 'title' || object[key] === undefined || object[key] === null)
      return;

    const bindingCandidate = bindings[key];
    const isFolder = bindingCandidate.title;
    const isBinding = bindingCandidate.label;
    if (isFolder) {
      const subFolder = folder.addFolder({
        title: bindingCandidate.title,
        expanded: false
      });
      object[key].__parent = object;
      object[key].__sceneObjects = sceneObjects;
      buildBindings(subFolder, object[key], bindingCandidate, sceneObjects);
      return;
    }
    if (!isBinding) return;
    // Forcing all pickers inline to prevent layout issues.
    // Not all bindings have pickers but there's no harm in setting it inline even if there's no picker
    bindingCandidate.picker = 'inline';
    const binding = folder.addBinding(object, key, bindingCandidate);
    if (bindingCandidate.onChange) {
      binding.on(
        'change',
        bindingCandidate.onChange.bind(null, {
          object,
          folder,
          bindings,
          sceneObjects
        })
      );
    }
    if (bindingCandidate.details) {
      const subFolder = folder.addFolder({
        title: `${bindingCandidate.label} Details`,
        expanded: false
      });

      if (bindingCandidate.details.onDetailsChange) {
        // prettier-ignore
        // console.log('candidate.details.onChange', { 'candidate.details': bindingCandidate.details, object, 'object[key]': object[key], binding });
        // TODO: make this auto for anything that has details
        subFolder.on(
          'change',
          bindingCandidate.details.onDetailsChange.bind(null, object[key])
        );
        delete bindingCandidate.details.onDetailsChange;
      }
      buildBindings(
        subFolder,
        object[key],
        bindingCandidate.details,
        sceneObjects
      );
    }
    tweakBindingView(binding);
    if (bindingCandidate.format === radToDegFormatter) {
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

import * as THREE from 'three';
import { radToDegFormatter } from 'lib/utils';
import { numberCommon } from './bindingHelpers';
import { TextureBindings } from './TextureBindings';
import type { CommonGetterParams } from './bindingTypes';

const stencilOps = {
  ZeroStencilOp: THREE.ZeroStencilOp,
  KeepStencilOp: THREE.KeepStencilOp,
  ReplaceStencilOp: THREE.ReplaceStencilOp,
  IncrementStencilOp: THREE.IncrementStencilOp,
  DecrementStencilOp: THREE.DecrementStencilOp,
  IncrementWrapStencilOp: THREE.IncrementWrapStencilOp,
  DecrementWrapStencilOp: THREE.DecrementWrapStencilOp,
  InvertStencilOp: THREE.InvertStencilOp
};

const stencilFuncs = {
  NeverStencilFunc: THREE.NeverStencilFunc,
  LessStencilFunc: THREE.LessStencilFunc,
  EqualStencilFunc: THREE.EqualStencilFunc,
  LessEqualStencilFunc: THREE.LessEqualStencilFunc,
  GreaterStencilFunc: THREE.GreaterStencilFunc,
  NotEqualStencilFunc: THREE.NotEqualStencilFunc,
  GreaterEqualStencilFunc: THREE.GreaterEqualStencilFunc,
  AlwaysStencilFunc: THREE.AlwaysStencilFunc
};

const depthFuncs = {
  NeverDepth: THREE.NeverDepth,
  AlwaysDepth: THREE.AlwaysDepth,
  EqualDepth: THREE.EqualDepth,
  LessDepth: THREE.LessDepth,
  LessEqualDepth: THREE.LessEqualDepth,
  GreaterEqualDepth: THREE.GreaterEqualDepth,
  GreaterDepth: THREE.GreaterDepth,
  NotEqualDepth: THREE.NotEqualDepth
};

const blendingModes = {
  NoBlending: THREE.NoBlending,
  NormalBlending: THREE.NormalBlending,
  AdditiveBlending: THREE.AdditiveBlending,
  SubtractiveBlending: THREE.SubtractiveBlending,
  MultiplyBlending: THREE.MultiplyBlending,
  CustomBlending: THREE.CustomBlending
};

const blendEquations = {
  AddEquation: THREE.AddEquation,
  SubtractEquation: THREE.SubtractEquation,
  ReverseSubtractEquation: THREE.ReverseSubtractEquation,
  MinEquation: THREE.MinEquation,
  MaxEquation: THREE.MaxEquation
};

const blendDstFactors = {
  ZeroFactor: THREE.ZeroFactor,
  OneFactor: THREE.OneFactor,
  SrcColorFactor: THREE.SrcColorFactor,
  OneMinusSrcColorFactor: THREE.OneMinusSrcColorFactor,
  SrcAlphaFactor: THREE.SrcAlphaFactor,
  OneMinusSrcAlphaFactor: THREE.OneMinusSrcAlphaFactor,
  DstAlphaFactor: THREE.DstAlphaFactor,
  OneMinusDstAlphaFactor: THREE.OneMinusDstAlphaFactor,
  DstColorFactor: THREE.DstColorFactor,
  OneMinusDstColorFactor: THREE.OneMinusDstColorFactor,
  ConstantColorFactor: THREE.ConstantColorFactor,
  OneMinusConstantColorFactor: THREE.OneMinusConstantColorFactor,
  ConstantAlphaFactor: THREE.ConstantAlphaFactor,
  OneMinusConstantAlphaFactor: THREE.OneMinusConstantAlphaFactor
};

const blendSrcFactors = {
  ...blendDstFactors,
  SrcAlphaSaturateFactor: THREE.SrcAlphaSaturateFactor // exclusive for Src factors
};

export const MaterialBindings = (params: CommonGetterParams) => ({
  // TODO: Add: a way to show userData
  id: {
    label: 'ID',
    disabled: true
  },
  uuid: {
    label: 'UUID',
    disabled: true
  },
  name: {
    label: 'Name',
    disabled: true
  },
  visible: {
    label: 'Visible',
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
  shadowSide: {
    label: 'Shadow Side',
    options: {
      FrontSide: THREE.FrontSide,
      BackSide: THREE.BackSide,
      DoubleSide: THREE.DoubleSide
    }
  },
  wireframe: {
    label: 'Wireframe',
    view: 'toggle'
  },
  color: {
    label: 'Color',
    color: { type: 'float' },
    view: 'color'
  },
  map: {
    label: 'Color Map',
    details: {
      ...TextureBindings(params)
    }
  },
  emissive: {
    label: 'Emissive',
    color: { type: 'float' },
    view: 'color'
  },
  emissiveMap: {
    label: 'Emissive Map',
    details: {
      ...TextureBindings(params)
    }
  },
  emissiveIntensity: {
    label: 'Emissive Intensity',
    min: 0,
    ...numberCommon
  },
  aoMap: {
    label: 'AO Map',
    details: {
      ...TextureBindings(params)
    }
  },
  aoMapIntensity: {
    label: 'AO Map Intensity',
    min: 0,
    ...numberCommon,
    if: (material: THREE.MeshStandardMaterial) => !!material.aoMap
  },
  roughness: {
    label: 'Roughness',
    min: 0,
    max: 1,
    ...numberCommon
  },
  roughnessMap: {
    label: 'Roughness Map',
    details: {
      ...TextureBindings(params)
    }
  },
  specular: {
    label: 'Specular',
    color: { type: 'float' },
    view: 'color'
  },
  specularMap: {
    label: 'Specular Map',
    details: {
      ...TextureBindings(params)
    }
  },
  specularIntensity: {
    label: 'Specular Intensity',
    min: 0,
    max: 1,
    ...numberCommon
  },
  specularIntensityMap: {
    label: 'Specular Intensity Map',
    details: {
      ...TextureBindings(params)
    }
  },
  specularColor: {
    label: 'Specular Color',
    color: { type: 'float' },
    view: 'color'
  },
  specularColorMap: {
    label: 'Specular Color Map',
    details: {
      ...TextureBindings(params)
    }
  },
  metalness: {
    label: 'Metalness',
    min: 0,
    max: 1,
    ...numberCommon
  },
  metalnessMap: {
    label: 'Metalness Map',
    details: {
      ...TextureBindings(params)
    }
  },
  normalMap: {
    label: 'Normal Map',
    details: {
      ...TextureBindings(params)
    }
  },
  normalScale: {
    label: 'Normal Scale',
    ...numberCommon,
    if: (material: THREE.MeshStandardMaterial) => !!material.normalMap
  },
  normalMapType: {
    label: 'Normal Map Type',
    options: {
      TangentSpaceNormalMap: THREE.TangentSpaceNormalMap,
      ObjectSpaceNormalMap: THREE.ObjectSpaceNormalMap
    },
    if: (material: THREE.MeshStandardMaterial) => !!material.normalMap
  },
  bumpMap: {
    label: 'Bump Map',
    details: {
      ...TextureBindings(params)
    }
  },
  bumpScale: {
    label: 'Bump Scale',
    ...numberCommon,
    if: (material: THREE.MeshStandardMaterial) => !!material.bumpMap
  },
  displacementMap: {
    label: 'Displacement Map',
    details: {
      ...TextureBindings(params)
    }
  },
  displacementScale: {
    label: 'Displacement Scale',
    ...numberCommon,
    if: (material: THREE.MeshStandardMaterial) => !!material.displacementMap
  },
  displacementBias: {
    label: 'Displacement Bias',
    ...numberCommon,
    if: (material: THREE.MeshStandardMaterial) => !!material.displacementMap
  },
  envMap: {
    label: 'Env Map',
    details: {
      ...TextureBindings(params)
    }
  },
  envMapRotation: {
    // Euler: MeshStandardMaterial
    label: 'Env Map Rotation',
    ...numberCommon,
    ...(params.angleFormat === 'deg' ? { format: radToDegFormatter } : {}),
    if: (material: THREE.MeshStandardMaterial) => !!material.envMap
  },
  envMapIntensity: {
    label: 'Env Map Intensity',
    ...numberCommon,
    if: (material: THREE.MeshStandardMaterial) => !!material.envMap
  },
  lightMap: {
    label: 'Light Map',
    details: {
      ...TextureBindings(params)
    }
  },
  lightMapIntensity: {
    label: 'Light Map Intensity',
    ...numberCommon,
    min: 0,
    if: (material: THREE.MeshStandardMaterial) => !!material.lightMap
  },
  matcap: {
    label: 'Matcap',
    details: {
      ...TextureBindings(params)
    }
  },
  thickness: {
    label: 'Thickness',
    min: 0,
    ...numberCommon
  },
  thicknessMap: {
    label: 'Thickness Map',
    details: {
      ...TextureBindings(params)
    }
  },
  transmission: {
    label: 'Transmission',
    min: 0,
    max: 1,
    ...numberCommon
  },
  transmissionMap: {
    label: 'Transmission Map',
    details: {
      ...TextureBindings(params)
    }
  },
  gradientMap: {
    label: 'Gradient Map',
    details: {
      ...TextureBindings(params)
    }
  },
  alphaMap: {
    label: 'Alpha Map',
    details: {
      ...TextureBindings(params)
    }
  },
  transparent: {
    label: 'Transparent',
    view: 'toggle'
  },
  opacity: {
    label: 'Opacity',
    min: 0,
    max: 1,
    ...numberCommon
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
  premultipliedAlpha: {
    label: 'Premultiplied Alpha'
  },
  anisotropy: {
    label: 'Anisotropy'
  },
  anisotropyMap: {
    label: 'Anisotropy Map',
    details: {
      ...TextureBindings(params)
    }
  },
  anisotropyRotation: {
    // float: MeshPhysicalMaterial
    label: 'Anisotropy Rotation',
    ...(params.angleFormat === 'deg' ? { format: radToDegFormatter } : {})
  },
  attenuationColor: {
    label: 'Attenuation Color',
    color: { type: 'float' },
    view: 'color'
  },
  // attenuationDistance: {
  //   label: 'Attenuation Distance'
  // }, // default is Infinity. It breaks Tweakpane
  clearcoat: {
    label: 'Clearcoat',
    min: 0,
    max: 1,
    ...numberCommon
  },
  clearcoatMap: {
    label: 'Clearcoat Map',
    details: {
      ...TextureBindings(params)
    }
  },
  clearcoatNormalMap: {
    label: 'Clearcoat Normal Map',
    details: {
      ...TextureBindings(params)
    }
  },
  clearcoatNormalScale: {
    label: 'Clearcoat Normal Scale',
    min: 0,
    max: 1,
    ...numberCommon,
    if: (material: THREE.MeshPhysicalMaterial) => !!material.clearcoatNormalMap
  },
  clearcoatRoughness: {
    label: 'Clearcoat Roughness',
    min: 0,
    max: 1,
    ...numberCommon
  },
  clearcoatRoughnessMap: {
    label: 'Clearcoat Roughness Map',
    details: {
      ...TextureBindings(params)
    }
  },
  ior: {
    label: 'IOR',
    min: 0,
    max: 1,
    ...numberCommon
  },
  iridescence: {
    label: 'Iridescence',
    min: 0,
    max: 1,
    ...numberCommon
  },
  iridescenceMap: {
    label: 'Iridescence Map',
    details: {
      ...TextureBindings(params)
    }
  },
  iridescenceIOR: {
    label: 'Iridescence IOR',
    min: 1,
    max: 2.333,
    ...numberCommon
  },
  // iridescenceThicknessRange: {
  //   label: 'Iridescence Thickness Range',
  //   ...numberCommon
  // } // Tweakpane has no matching controller,
  iridescenceThicknessMap: {
    label: 'Iridescence Thickness Map',
    details: {
      ...TextureBindings(params)
    }
  },
  sheen: {
    label: 'Sheen',
    min: 0,
    max: 1,
    ...numberCommon
  },
  sheenColor: {
    label: 'Sheen Color',
    color: { type: 'float' },
    view: 'color'
  },
  sheenColorMap: {
    label: 'Sheen Color Map',
    details: {
      ...TextureBindings(params)
    }
  },
  sheenRoughness: {
    label: 'Sheen Roughness',
    min: 0,
    max: 1,
    ...numberCommon
  },
  sheenRoughnessMap: {
    label: 'Sheen Roughness Map',
    details: {
      ...TextureBindings(params)
    }
  },
  combine: {
    label: 'Combine',
    options: {
      MultiplyOperation: THREE.MultiplyOperation,
      MixOperation: THREE.MixOperation,
      AddOperation: THREE.AddOperation
    }
  },
  reflectivity: {
    label: 'Reflectivity',
    ...numberCommon,
    min: 0,
    max: 1
  },
  refractionRatio: {
    label: 'Refraction Ratio',
    ...numberCommon,
    min: 0,
    max: 1
  },
  shininess: {
    label: 'Shininess',
    ...numberCommon,
    min: 0
  },
  dithering: {
    label: 'Dithering'
  },

  rotation: {
    // float: SpriteMaterial
    label: 'Rotation',
    ...numberCommon,
    ...(params.angleFormat === 'deg' ? { format: radToDegFormatter } : {})
  },
  vertexColors: {
    label: 'Vertex Colors'
  },
  fog: {
    label: 'Fog'
  },
  flatShading: {
    label: 'Flat Shading'
  },
  blendAlpha: {
    label: 'Blend Alpha',
    ...numberCommon,
    min: 0
  },
  blendColor: {
    label: 'Blend Color',
    color: { type: 'float' },
    view: 'color'
  },
  blendSrc: {
    label: 'Blend Src',
    options: {
      ...blendSrcFactors
    }
  },
  blendSrcAlpha: {
    label: 'Blend Src Alpha',
    options: {
      ...blendSrcFactors
    }
  },
  blendDst: {
    label: 'Blend Dst',
    options: {
      ...blendDstFactors
    }
  },
  blendDstAlpha: {
    label: 'Blend Dst Alpha',
    options: {
      ...blendDstFactors
    }
  },
  blendEquation: {
    label: 'Blend Equation',
    options: {
      ...blendEquations
    }
  },
  blendEquationAlpha: {
    label: 'Blend Equation Alpha',
    options: {
      ...blendEquations
    }
  },
  blending: {
    label: 'Blending',
    options: {
      ...blendingModes
    }
  },
  clipIntersection: {
    label: 'Clip Intersection'
  },
  clipShadows: {
    label: 'Clip Shadows'
  },
  colorWrite: {
    label: 'Color Write'
  },
  depthFunc: {
    label: 'Depth Func',
    options: {
      ...depthFuncs
    }
  },
  depthTest: {
    label: 'Depth Test'
  },
  depthWrite: {
    label: 'Depth Write'
  },
  forceSinglePass: {
    label: 'Force Single Pass'
  },
  stencilWrite: {
    label: 'Stencil Write'
  },
  stencilWriteMask: {
    label: 'Stencil Write Mask',
    step: 1
  },
  stencilFunc: {
    label: 'Stencil Func',
    options: {
      ...stencilFuncs
    }
  },
  stencilRef: {
    label: 'Stencil Ref',
    step: 1
  },
  stencilFuncMask: {
    // TODO: properly handle masks as masks. Might require new Tweakpane plugin.
    label: 'Stencil Func Mask',
    step: 1
  },
  stencilFail: {
    label: 'Stencil Fail',
    options: {
      ...stencilOps
    }
  },
  stencilZFail: {
    label: 'Stencil ZFail',
    options: {
      ...stencilOps
    }
  },
  stencilZPass: {
    label: 'Stencil ZPass',
    options: {
      ...stencilOps
    }
  },
  polygonOffset: {
    label: 'Polygon Offset'
  },
  polygonOffsetFactor: {
    label: 'Polygon Offset Factor',
    step: 1
  },
  polygonOffsetUnits: {
    label: 'Polygon Offset Units',
    step: 1
  },
  precision: {
    label: 'Precision',
    options: {
      highp: 'highp',
      mediump: 'mediump',
      lowp: 'lowp'
    }
  },
  toneMapped: {
    label: 'Tone Mapped'
  },
  glslVersion: {
    label: 'GLSL Version',
    options: {
      GLSL1: THREE.GLSL1,
      GLSL3: THREE.GLSL3
    }
  },
  clipping: {
    label: 'Clipping'
  },
  lights: {
    label: 'Lights'
  },
  size: {
    label: 'Size',
    ...numberCommon,
    min: 0.001
  },
  sizeAttenuation: {
    label: 'Size Attenuation'
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
  depthPacking: {
    label: 'Depth Packing',
    options: {
      BasicDepthPacking: THREE.BasicDepthPacking,
      RGBADepthPacking: THREE.RGBADepthPacking
    }
  }
});

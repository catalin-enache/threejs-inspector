import * as THREE from 'three';
import { radToDegFormatter } from 'lib/utils/mathUtils';
import { numberCommon } from './bindingHelpers';
import type { CommonGetterParams, onChange } from './bindingTypes';

const wrapOptions = {
  ClampToEdgeWrapping: THREE.ClampToEdgeWrapping,
  RepeatWrapping: THREE.RepeatWrapping,
  MirroredRepeatWrapping: THREE.MirroredRepeatWrapping
};

export const TextureBindings = (params: CommonGetterParams) => ({
  id: {
    label: 'ID',
    view: 'text',
    disabled: true,
    format: (value: number) => value.toFixed(0)
  },
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
      RGBFormat: THREE.RGBFormat,
      RGBAFormat: THREE.RGBAFormat,
      RGBAIntegerFormat: THREE.RGBAIntegerFormat,
      LuminanceFormat: THREE.LuminanceFormat,
      LuminanceAlphaFormat: THREE.LuminanceAlphaFormat,
      DepthFormat: THREE.DepthFormat,
      DepthStencilFormat: THREE.DepthStencilFormat,
      RGB_S3TC_DXT1_Format: THREE.RGB_S3TC_DXT1_Format,
      RGBA_S3TC_DXT1_Format: THREE.RGBA_S3TC_DXT1_Format,
      RGBA_S3TC_DXT3_Format: THREE.RGBA_S3TC_DXT3_Format,
      RGBA_S3TC_DXT5_Format: THREE.RGBA_S3TC_DXT5_Format,
      RGB_PVRTC_4BPPV1_Format: THREE.RGB_PVRTC_4BPPV1_Format,
      RGB_PVRTC_2BPPV1_Format: THREE.RGB_PVRTC_2BPPV1_Format,
      RGBA_PVRTC_4BPPV1_Format: THREE.RGBA_PVRTC_4BPPV1_Format,
      RGBA_PVRTC_2BPPV1_Format: THREE.RGBA_PVRTC_2BPPV1_Format,
      RGB_ETC1_Format: THREE.RGB_ETC1_Format,
      RGB_ETC2_Format: THREE.RGB_ETC2_Format,
      RGBA_ETC2_EAC_Format: THREE.RGBA_ETC2_EAC_Format,
      RGBA_ASTC_4x4_Format: THREE.RGBA_ASTC_4x4_Format,
      RGBA_ASTC_5x4_Format: THREE.RGBA_ASTC_5x4_Format,
      RGBA_ASTC_5x5_Format: THREE.RGBA_ASTC_5x5_Format,
      RGBA_ASTC_6x5_Format: THREE.RGBA_ASTC_6x5_Format,
      RGBA_ASTC_6x6_Format: THREE.RGBA_ASTC_6x6_Format,
      RGBA_ASTC_8x5_Format: THREE.RGBA_ASTC_8x5_Format,
      RGBA_ASTC_8x6_Format: THREE.RGBA_ASTC_8x6_Format,
      RGBA_ASTC_8x8_Format: THREE.RGBA_ASTC_8x8_Format,
      RGBA_ASTC_10x5_Format: THREE.RGBA_ASTC_10x5_Format,
      RGBA_ASTC_10x6_Format: THREE.RGBA_ASTC_10x6_Format,
      RGBA_ASTC_10x8_Format: THREE.RGBA_ASTC_10x8_Format,
      RGBA_ASTC_10x10_Format: THREE.RGBA_ASTC_10x10_Format,
      RGBA_ASTC_12x10_Format: THREE.RGBA_ASTC_12x10_Format,
      RGBA_ASTC_12x12_Format: THREE.RGBA_ASTC_12x12_Format,
      RGBA_BPTC_Format: THREE.RGBA_BPTC_Format,
      RGB_BPTC_SIGNED_Format: THREE.RGB_BPTC_SIGNED_Format,
      RGB_BPTC_UNSIGNED_Format: THREE.RGB_BPTC_UNSIGNED_Format,
      RED_RGTC1_Format: THREE.RED_RGTC1_Format,
      SIGNED_RED_RGTC1_Format: THREE.SIGNED_RED_RGTC1_Format,
      RED_GREEN_RGTC2_Format: THREE.RED_GREEN_RGTC2_Format,
      SIGNED_RED_GREEN_RGTC2_Format: THREE.SIGNED_RED_GREEN_RGTC2_Format
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
    max: 3,
    format: (value: number) => value.toFixed(0)
  },
  wrapS: {
    label: 'Wrap S',
    options: {
      ...wrapOptions
    }
  },
  wrapT: {
    label: 'Wrap T',
    options: {
      ...wrapOptions
    }
  },
  wrapR: {
    label: 'Wrap R',
    options: {
      ...wrapOptions
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
  colorSpace: {
    label: 'Color Space',
    options: {
      NoColorSpace: THREE.NoColorSpace,
      SRGBColorSpace: THREE.SRGBColorSpace,
      LinearSRGBColorSpace: THREE.LinearSRGBColorSpace
    }
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
  compareFunction: {
    options: {
      NeverCompare: THREE.NeverCompare,
      LessCompare: THREE.LessCompare,
      EqualCompare: THREE.EqualCompare,
      LessEqualCompare: THREE.LessEqualCompare,
      GreaterCompare: THREE.GreaterCompare,
      NotEqualCompare: THREE.NotEqualCompare,
      GreaterEqualCompare: THREE.GreaterEqualCompare,
      AlwaysCompare: THREE.AlwaysCompare
    }
  },
  onDetailsChange: (({ object }) => {
    // some props won't be reflected without needsUpdate = true
    // this is not only for the image but for other props (e.g. flipY, minFilter ...)
    // Warn: due to this, sliders (e.g. offset/rotation/repeat) will become less responsive for larger images.
    // Many sliders, when changed, do not even require to update the texture, but we're gathering everything here.
    (object as THREE.Texture).needsUpdate = true;
  }) as onChange
});

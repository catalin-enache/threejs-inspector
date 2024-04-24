import * as THREE from 'three';
import { radToDegFormatter } from 'lib/utils';
import { numberCommon } from './bindingHelpers';
import type { CommonGetterParams, onChange } from './bindingTypes';

export const TextureBindings = (params: CommonGetterParams) => ({
  id: {
    label: 'ID',
    view: 'text',
    disabled: true
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
  onDetailsChange: (({ object }) => {
    // console.log('texture changed', object);
    // some props won't be reflected without needsUpdate = true
    // this is not only for the image but for other props (e.g. flipY, minFilter ...)
    // Warn: due to this, sliders (e.g. offset/rotation/repeat) will become less responsive for larger images.
    // Many sliders, when changed, do not even require to update the texture, but we're gathering everything here.
    (object as THREE.Texture).needsUpdate = true;
  }) as onChange
});

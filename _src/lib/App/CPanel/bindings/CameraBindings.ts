import { numberCommon } from './bindingHelpers';

export const PerspectiveCameraBindings = () => ({
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

export const OrthographicCameraBindings = () => ({
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

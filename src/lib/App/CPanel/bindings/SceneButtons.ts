import { useAppStore } from 'src/store';
import { focusCamera } from 'lib/utils/cameraUtils';
import type { CommonGetterParams, onChange } from './bindingTypes';
import { numberCommon } from 'lib/App/CPanel/bindings/bindingHelpers';

// keys are not relevant for buttons
export const SceneButtons = ({ playingState, sceneObjects: { camera, scene } }: CommonGetterParams) => ({
  0: {
    label: 'Full Screen Toggle( \\ | F11(native) )',
    title: 'Toggle Full Screen',
    onClick: (() => {
      useAppStore.getState().toggleFullscreen();
    }) as onChange
  },
  1: {
    label: 'Focus Camera ( F )',
    title: 'Focus Selected Object',
    onClick: (() => {
      focusCamera({
        camera,
        // @ts-ignore
        orbitControls: scene.__inspectorData.orbitControlsRef.current,
        // @ts-ignore
        transformControls: scene.__inspectorData.transformControlsRef.current
      });
    }) as onChange
  },
  2: {
    label: 'Show Helpers ( H|CAS+H )',
    title: 'Toggle Helpers',
    onClick: (() => {
      useAppStore.getState().toggleShowHelpers();
    }) as onChange
  },
  3: {
    label: 'Show Gizmos ( G|CAS+G )',
    title: 'Toggle Gizmos',
    onClick: (() => {
      useAppStore.getState().toggleShowGizmos();
    }) as onChange
  },
  4: {
    label: 'Toggle AxesHelper',
    title: 'Toggle AxesHelper',
    onClick: ((_) => {
      useAppStore.getState().toggleShowAxesHelper();
    }) as onChange
  },
  5: {
    label: 'Toggle GridHelper',
    title: 'Toggle GridHelper',
    onClick: ((_) => {
      useAppStore.getState().toggleShowGridHelper();
    }) as onChange
  },
  gizmoSize: {
    label: 'Gizmo Size (refresh page to take effect)',
    min: 0.1,
    max: 20,
    ...numberCommon,
    onChange: ((_, evt) => {
      useAppStore.getState().setGizmoSize(evt.value);
    }) as onChange
  },
  6: {
    label: 'Play/Pause ( Space|CAS+Space )',
    title: playingState === 'playing' ? 'Pause' : 'Play',
    onClick: (() => {
      const currentPlayingState = useAppStore.getState().playingState;
      useAppStore.getState().setPlaying(currentPlayingState === 'playing' ? 'paused' : 'playing');
    }) as onChange,
    if: () => !useAppStore.getState().isInjected
  },
  7: {
    label: 'Stop ( Backspace|CAS+Backspace )',
    title: 'Stop',
    onClick: (() => {
      useAppStore.getState().setPlaying('stopped');
    }) as onChange,
    if: () => !useAppStore.getState().isInjected
  },
  8: {
    label: 'Load Model',
    title: 'Load Model',
    onClick: (() => {
      useAppStore.getState().setLoadModelIsOpen(true);
    }) as onChange
  }
});

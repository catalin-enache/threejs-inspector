import { useAppStore } from 'src/store';
import { focusCamera } from 'lib/utils/camera/cameraUtils';
import { exportObject } from 'lib/utils/downloadUtils';
import type { CommonGetterParams, onChange } from './bindingTypes';
import { numberCommon } from './bindingHelpers';
import patchThree from 'lib/patchThree';

// keys are not relevant for buttons
export const SceneButtons = ({ playingState, sceneObjects: { scene } }: CommonGetterParams) => ({
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
      focusCamera();
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
  6: {
    label: 'Toggle SceneSize Helper',
    title: 'Toggle SceneSize Helper',
    onClick: ((_) => {
      useAppStore.getState().toggleShowSceneSizeHelper();
    }) as onChange
  },
  7: {
    label: 'Play/Pause',
    title: playingState === 'playing' ? 'Pause' : 'Play',
    onClick: (() => {
      const currentPlayingState = useAppStore.getState().playingState;
      useAppStore.getState().setPlayingState(currentPlayingState === 'playing' ? 'paused' : 'playing');
    }) as onChange
    // if: () => !useAppStore.getState().isInjected
  },
  8: {
    label: 'Stop',
    title: 'Stop',
    onClick: (() => {
      useAppStore.getState().setPlayingState('stopped');
    }) as onChange
    // if: () => !useAppStore.getState().isInjected
  },
  9: {
    label: 'Load Object',
    title: 'Load Object',
    onClick: (() => {
      useAppStore.getState().setLoadObjectIsOpen(true);
    }) as onChange
  },
  10: {
    label: 'Clear Scene',
    title: 'Clear Scene',
    onClick: (() => {
      patchThree.clearScene({ log: true });
    }) as onChange
  },
  11: {
    label: 'Download Scene',
    title: 'Download Scene',
    onClick: (async () => {
      // TODO: allow choosing json type
      await exportObject(scene, { type: 'json' });
    }) as onChange,
    if: () => scene.children.length > 0
  },
  12: {
    title: 'Update Cube Cameras',
    label: 'Update Cube Cameras',
    onClick: (async () => {
      patchThree.updateCubeCameras();
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
  frameLoop: {
    label: 'Frame Loop',
    view: 'radiogrid',
    groupName: 'frameLoop',
    size: [3, 1],
    cells: (x: number, _y: number) => ({
      title: x === 0 ? 'Always' : x === 1 ? 'Demand' : 'Never',
      value: x === 0 ? 'always' : x === 1 ? 'demand' : 'never'
    }),
    onChange: ((_, evt: any) => {
      const rootState = patchThree.getThreeRootState();
      rootState.setFrameloop(evt.value);
      setTimeout(() => {
        rootState.gl.render(rootState.scene, rootState.camera);
      });
    }) as onChange
  }
});

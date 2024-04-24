import { useAppStore } from 'src/store';
import { focusCamera } from 'lib/utils';
import type { CommonGetterParams, onChange } from './bindingTypes';

// keys are not relevant for buttons
export const SceneButtons = ({ isPlaying }: CommonGetterParams) => ({
  0: {
    label: 'Full Screen Toggle( \\ | F11(native) )',
    title: 'Toggle Full Screen',
    onClick: () => {
      useAppStore.getState().toggleFullscreen();
    }
  },
  1: {
    label: 'Focus Camera ( F )',
    title: 'Focus Selected Object',
    onClick: (({ sceneObjects: { scene, camera } }) => {
      focusCamera({
        camera,
        // @ts-ignore
        orbitControls: scene.orbitControlsRef.current,
        // @ts-ignore
        transformControls: scene.transformControlsRef.current
      });
    }) as onChange
  },
  2: {
    label: 'Show Helpers ( CAS+H )',
    title: 'Toggle Helpers',
    onClick: () => {
      useAppStore.getState().toggleShowHelpers();
    }
  },
  3: {
    label: 'Show Gizmos ( CAS+G )',
    title: 'Toggle Gizmos',
    onClick: () => {
      useAppStore.getState().toggleShowGizmos();
    }
  },
  4: {
    label: 'Play/Stop ( Space|CAS+Space )',
    title: isPlaying ? 'Stop' : 'Play',
    onClick: () => {
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
});

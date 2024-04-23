import { useAppStore } from 'src/store';
import { focusCamera } from 'lib/utils';
import type { CommonGetterParams, SceneObjects } from './bindingTypes';

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

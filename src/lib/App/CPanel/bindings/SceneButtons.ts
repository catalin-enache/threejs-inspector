import { useAppStore } from 'src/store';
import { focusCamera } from 'lib/utils';
import type { CommonGetterParams, onChange } from './bindingTypes';
import { loadModel } from 'lib/utils/loadModel';

const rootExtensions = ['.glb', '.gltf', '.obj', '.fbx', '.dae', '.3ds', '.stl', '.ply', '.vtk'];
const allowedExtensions = [
  ...rootExtensions,
  '.bin',
  '.mtl',
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.tif',
  '.tiff',
  '.exr',
  '.hdr',
  '.tga',
  '.ktx2',
  '.dds'
];

// keys are not relevant for buttons
export const SceneButtons = ({ isPlaying, sceneObjects: { camera, scene } }: CommonGetterParams) => ({
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
        orbitControls: scene.orbitControlsRef.current,
        // @ts-ignore
        transformControls: scene.transformControlsRef.current
      });
    }) as onChange
  },
  2: {
    label: 'Show Helpers ( CAS+H )',
    title: 'Toggle Helpers',
    onClick: (() => {
      useAppStore.getState().toggleShowHelpers();
    }) as onChange
  },
  3: {
    label: 'Show Gizmos ( CAS+G )',
    title: 'Toggle Gizmos',
    onClick: (() => {
      useAppStore.getState().toggleShowGizmos();
    }) as onChange
  },
  4: {
    label: 'Play/Stop ( Space|CAS+Space )',
    title: isPlaying ? 'Stop' : 'Play',
    onClick: (() => {
      useAppStore.getState().togglePlaying();
    }) as onChange
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
  },
  5: {
    label: 'Load Model',
    title: 'Load Model',
    onClick: (() => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = allowedExtensions.join(',');
      input.multiple = true;
      input.onchange = (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (!files || !files.length) return;
        const filesArray = Array.from(files);
        const rootFile = filesArray.find((file) => rootExtensions.some((ext) => file.name.endsWith(ext)));
        if (!rootFile) return;
        // inspired from https://github.com/donmccurdy/three-gltf-viewer/blob/main/src/viewer.js#L159-L191
        // https://gltf-viewer.donmccurdy.com/
        loadModel(rootFile, scene, { filesArray }).then((mesh) => {
          mesh && scene.add(mesh);
        });
      };
      input.click();
    }) as onChange
  }
});

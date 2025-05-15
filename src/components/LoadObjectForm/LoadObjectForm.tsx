import { useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Modal } from 'components/Modal/Modal';
import { useAppStore } from 'src/store';
import { loadObject } from 'lib/utils/loadObject';
import patchThree from 'lib/patchThree';
import './LoadObjectForm.css';

// model extensions
const rootExtensions = ['.glb', '.gltf', '.obj', '.fbx', '.dae', '.3ds', '.stl', '.ply', '.vtk'];
const allowedExtensions = [
  ...rootExtensions,
  // image extensions and other related deps
  // when uploading a model, we also need to upload its textures that the model will look after when initialised
  // our configured loadingManager takes care to register the files and create objectURLs for them
  // so that when the model asks for the texture, it gets the objectURL which serves the purpose.
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
  '.pvr',
  '.dds',
  '.json',
  '.bson',
  '.ejson'
];

// Using imperative DOM since we cannot use React predefined elements inside R3F canvas.
export const LoadObjectForm = () => {
  const loadAssetIsOpen = useAppStore((state) => state.loadObjectIsOpen);
  const setLoadAssetIsOpen = useAppStore((state) => state.setLoadObjectIsOpen);
  const contentRef = useRef<any>(null);
  const changeGeometry = useRef<'indexed' | 'non-indexed' | undefined>(undefined);
  const autoScaleRatio = useRef<number>(0.4);
  const recombineByMaterial = useRef<boolean>(false);
  const makeInspectable = useRef<boolean>(true);
  const debug = useRef<string>('');

  const handleClose = useCallback(() => {
    setLoadAssetIsOpen(false);
  }, [setLoadAssetIsOpen]);

  useEffect(() => {
    // This runs only once until the page is refreshed.
    // The HTML is reused as well as the state.
    const content = document.createElement('div');
    content.className = 'loadObject';
    content.innerHTML = `
      <div>
        <div class="formRow">
          <label>
            <span>Make Inspectable</span>
            <input type="checkbox" class="makeInspectable" />
          </label>
        </div>
        <div class="formRow">
          <label>
            <span>Change geometry:</span>
            <select class="changeGeometry">
              <option value="">Don't change</option>
              <option value="indexed">Indexed</option>
              <option value="non-indexed">Non-indexed</option>
            </select>
          </label>
        </div>
        <div class="formRow">
          <label>
            <span>Recombine by material</span>
            <input type="checkbox" class="recombineByMaterial" />
          </label>
        </div>
        <div class="formRow">
          <label>
            <span>Autoscale (0.01..1)</span>
            <input type="number" class="autoScale" />
          </label>
        </div>
        <div class="formRow">
          <label>
            <span>Debug ([meshName] | ALL)</span>
            <input type="text" class="debug" />
          </label>
        </div>
        <div class="formRow">
          <label>
            <button class="upload">Load</button>
          </label>
        </div>
      </div>
    `;

    const changeGeometryInput = content.querySelector('.changeGeometry');
    changeGeometryInput?.addEventListener('change', (e) => {
      const value = (e.target as HTMLSelectElement).value;
      changeGeometry.current = value ? (value as 'indexed' | 'non-indexed') : undefined;
    });

    const autoScaleInput = content.querySelector('.autoScale') as HTMLInputElement;
    autoScaleInput.value = autoScaleRatio.current.toString();
    autoScaleInput?.addEventListener('change', (e) => {
      const value = +parseFloat((e.target as HTMLInputElement).value).toFixed(2);
      autoScaleRatio.current = value;
    });

    const makeInspectableInput = content.querySelector('.makeInspectable') as HTMLInputElement;
    makeInspectableInput.checked = makeInspectable.current;
    makeInspectableInput?.addEventListener('change', (e) => {
      makeInspectable.current = (e.target as HTMLInputElement).checked;
    });

    const recombineByMaterialInput = content.querySelector('.recombineByMaterial') as HTMLInputElement;
    recombineByMaterialInput.checked = recombineByMaterial.current;
    recombineByMaterialInput?.addEventListener('change', (e) => {
      recombineByMaterial.current = (e.target as HTMLInputElement).checked;
    });

    const debugInput = content.querySelector('.debug') as HTMLInputElement;
    debugInput.value = debug.current;
    debugInput?.addEventListener('change', (e) => {
      debug.current = (e.target as HTMLInputElement).value;
    });

    const uploadBtn = content.querySelector('.upload');
    uploadBtn?.addEventListener('click', () => uploadInput.click());
    const uploadInput = document.createElement('input');
    uploadInput.type = 'file';
    uploadInput.accept = allowedExtensions.join(',');
    uploadInput.multiple = true;

    uploadInput.onchange = (e) => {
      const scene = patchThree.getCurrentScene();
      const camera = patchThree.getCurrentCamera();
      setLoadAssetIsOpen(false);
      const files = (e.target as HTMLInputElement).files;
      if (!files || !files.length) return;
      const filesArray = Array.from(files);
      // reset input so we can upload the same file again
      uploadInput.value = '';
      // this is for importing JSON scenario.
      patchThree.isSafeToMakeHelpers = false;
      loadObject(filesArray, {
        scene,
        camera,
        changeGeometry: changeGeometry.current, // 'indexed' | 'non-indexed'
        recombineByMaterial: recombineByMaterial.current,
        autoScaleRatio: autoScaleRatio.current, // 0..1 percentage
        debug: debug.current // <meshName> || 'ALL'
      })
        .then((object) => {
          patchThree.isSafeToMakeHelpers = true;
          if (object) {
            // @ts-ignore
            if (!object.isScene) {
              if (makeInspectable.current) {
                object.__inspectorData.isInspectable = true;
              }
              scene.add(object);
              patchThree.updateSceneBBox({ action: 'add', object });
            } else {
              patchThree.clearScene();
              const importedScene = object as unknown as THREE.Scene;
              const importedSceneChildren = [...importedScene.children];

              scene.background = importedScene.background;
              scene.environment = importedScene.environment;

              importedSceneChildren.forEach((child) => {
                scene.add(child);
                patchThree.updateSceneBBox({ action: 'add', object: child });
              });

              patchThree.refreshCPanel();
              patchThree.updateCubeCameras();
            }
          }
        })
        .catch((error) => {
          console.error('Could not load object', error, filesArray);
          patchThree.isSafeToMakeHelpers = true;
        });
    };

    contentRef.current = content;
  }, [setLoadAssetIsOpen]);

  return (
    <Modal isOpen={loadAssetIsOpen} onClose={handleClose} title="Options" width="250px">
      {contentRef.current}
    </Modal>
  );
};

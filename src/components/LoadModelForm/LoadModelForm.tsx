import { useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Modal } from 'components/Modal/Modal';
import { useAppStore } from 'src/store';
import { loadModel } from 'lib/utils/loadModel';
import './LoadModelForm.css';

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

interface LoadModelFormProps {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
}

// Using imperative DOM since we cannot use React predefined elements inside R3F canvas.
export const LoadModelForm = (props: LoadModelFormProps) => {
  const { scene, camera } = props;
  const loadAssetIsOpen = useAppStore((state) => state.loadModelIsOpen);
  const setLoadAssetIsOpen = useAppStore((state) => state.setLoadModelIsOpen);
  const contentRef = useRef<any>(null);
  const changeGeometry = useRef<'indexed' | 'non-indexed' | undefined>(undefined);
  const autoScaleRatio = useRef<number>(0.4);
  const recombineByMaterial = useRef<boolean>(false);
  const debug = useRef<string>('');

  const handleClose = useCallback(() => {
    setLoadAssetIsOpen(false);
  }, []);

  useEffect(() => {
    // This runs only once until the page is refreshed.
    // The HTML is reused as well as the state.
    const content = document.createElement('div');
    content.className = 'loadModel';
    content.innerHTML = `
      <div>
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
      setLoadAssetIsOpen(false);
      const files = (e.target as HTMLInputElement).files;
      if (!files || !files.length) return;
      const filesArray = Array.from(files);
      const rootFile = filesArray.find((file) => rootExtensions.some((ext) => file.name.toLowerCase().endsWith(ext)));
      // reset input so we can upload the same file again
      uploadInput.value = '';
      if (!rootFile) return;
      loadModel(rootFile, {
        filesArray,
        scene,
        camera,
        changeGeometry: changeGeometry.current, // 'indexed' | 'non-indexed'
        recombineByMaterial: recombineByMaterial.current,
        autoScaleRatio: autoScaleRatio.current, // 0..1 percentage
        debug: debug.current // <meshName> || 'ALL'
      }).then((mesh) => {
        mesh && scene.add(mesh);
      });
    };

    contentRef.current = content;
  }, []);

  return (
    <Modal isOpen={loadAssetIsOpen} onClose={handleClose} title="Options" width="250px">
      {contentRef.current}
    </Modal>
  );
};

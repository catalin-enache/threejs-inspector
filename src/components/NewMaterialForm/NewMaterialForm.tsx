import * as THREE from 'three';
import { useAppStore } from 'src/store';
import { Modal } from 'components/Modal/Modal';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import patchThree from 'lib/patchThree';
import { getMapsKeysForMaterial, getMaterialFromType } from 'lib/utils/materialUtils';
import './NewMaterialForm.css';

export const NewMaterialForm = () => {
  const newMaterialFormIsOpen = useAppStore((state) => state.newMaterialFormIsOpen);
  const setNewMaterialFormIsOpen = useAppStore((state) => state.setNewMaterialFormIsOpen);
  const material = patchThree.materialToEdit;
  const contentRef = useRef<HTMLDivElement | null>(null);
  const lastMaterialTypeRef = useRef<string | null>(null);
  const lastDestroyCurrentMaterialRef = useRef<boolean>(false);
  const lastDestroyCurrentMaterialTexturesRef = useRef<boolean>(false);
  const objectToEdit = patchThree.objectToEdit;

  const objects = useMemo(() => {
    return Array.isArray(objectToEdit) ? objectToEdit : objectToEdit ? [objectToEdit] : null;
  }, [objectToEdit, newMaterialFormIsOpen]);

  if (material) {
    lastMaterialTypeRef.current = material.constructor.name;
  }

  const handleClose = useCallback(() => {
    setNewMaterialFormIsOpen(false);
  }, [setNewMaterialFormIsOpen]);

  useEffect(() => {
    const content = document.createElement('div');
    content.id = 'newMaterialForm';
    contentRef.current = content;

    return () => {
      contentRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!contentRef.current || !objects || !material) return;

    const content = contentRef.current;

    const handleChange = (event: Event) => {
      const target = event.target as HTMLInputElement | HTMLSelectElement;
      const dataMap = target.getAttribute('data-map');

      if (!dataMap) return;

      if (dataMap === 'materialType') {
        const newMaterialType = (target as HTMLSelectElement).value;
        lastMaterialTypeRef.current = newMaterialType;
      } else if (dataMap === 'destroyCurrentMaterial') {
        lastDestroyCurrentMaterialRef.current = (target as HTMLInputElement).checked;
      } else if (dataMap === 'destroyCurrentMaterialTextures') {
        lastDestroyCurrentMaterialTexturesRef.current = (target as HTMLInputElement).checked;
      }
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      const dataMap = target.getAttribute('data-map');
      if (!dataMap) return;

      if (dataMap === 'submit') {
        const destroyCurrentMaterial = lastDestroyCurrentMaterialRef.current;
        const destroyCurrentMaterialTextures = lastDestroyCurrentMaterialTexturesRef.current;
        const newMaterialType = lastMaterialTypeRef.current ?? material.constructor.name;

        const newMaterial = getMaterialFromType(newMaterialType, {
          name: material.name
        });
        newMaterial.needsUpdate = true;

        if (destroyCurrentMaterial) {
          if (destroyCurrentMaterialTextures) {
            const mapsKeys = getMapsKeysForMaterial(material).map((item) => item.name);
            mapsKeys.forEach((mapKey) => {
              const key = mapKey as keyof THREE.Material;
              if (material[key] && material[key] instanceof THREE.Texture) {
                material[key].dispose();
              }
            });
          }
          material.dispose();
        }

        objects.forEach((object) => {
          if (object.material === material) {
            object.material = newMaterial;
          } else if (Array.isArray(object.material)) {
            const index = object.material.indexOf(material);
            if (index !== -1) {
              object.material[index] = newMaterial;
            }
          }
        });

        useAppStore.getState().triggerCPanelStateChanged();
        setNewMaterialFormIsOpen(false);
      }
    };

    content.addEventListener('click', handleClick);
    content.addEventListener('change', handleChange);

    return () => {
      content.removeEventListener('click', handleClick);
      content.removeEventListener('change', handleChange);
    };
  }, [objects, material, setNewMaterialFormIsOpen]);

  useEffect(() => {
    if (!contentRef.current || !objects || !objects.length) return;

    const content = contentRef.current;
    const sampleObject = objects[0];

    content.innerHTML = `
      <div>
    `;

    if (sampleObject instanceof THREE.Line) {
      content.innerHTML += `
      <div class="formRow">
        <label>
          <span>New material type:</span>
          <select class="materialType" data-map="materialType">
            <option value="LineBasicMaterial" ${
              lastMaterialTypeRef.current === 'LineBasicMaterial' ? 'selected' : ''
            }>LineBasicMaterial</option>
            <option value="LineDashedMaterial" ${
              lastMaterialTypeRef.current === 'LineDashedMaterial' ? 'selected' : ''
            }>LineDashedMaterial</option>
          </select>
        </label>
      </div>
    `;
    } else if (sampleObject instanceof THREE.Points) {
      content.innerHTML += `
      <div class="formRow">
        <label>
          <span>New material type:</span>
          <select class="materialType" data-map="materialType">
            <option value="PointsMaterial" ${
              lastMaterialTypeRef.current === 'PointsMaterial' ? 'selected' : ''
            }>PointsMaterial</option>
          </select>
        </label>
      </div>
    `;
    } else if (sampleObject instanceof THREE.Sprite) {
      content.innerHTML += `
      <div class="formRow">
        <label>
          <span>New material type:</span>
          <select class="materialType" data-map="materialType">
            <option value="SpriteMaterial" ${
              lastMaterialTypeRef.current === 'SpriteMaterial' ? 'selected' : ''
            }>SpriteMaterial</option>
          </select>
        </label>
      </div>
    `;
    } else {
      content.innerHTML += `
      <div class="formRow">
        <label>
          <span>New material type:</span>
          <select class="materialType" data-map="materialType">
            <option value="MeshBasicMaterial" ${
              lastMaterialTypeRef.current === 'MeshBasicMaterial' ? 'selected' : ''
            }>MeshBasicMaterial</option>
            <option value="MeshStandardMaterial" ${
              lastMaterialTypeRef.current === 'MeshStandardMaterial' ? 'selected' : ''
            }>MeshStandardMaterial</option>
            <option value="MeshLambertMaterial" ${
              lastMaterialTypeRef.current === 'MeshLambertMaterial' ? 'selected' : ''
            }>MeshLambertMaterial</option>
            <option value="MeshPhongMaterial" ${
              lastMaterialTypeRef.current === 'MeshPhongMaterial' ? 'selected' : ''
            }>MeshPhongMaterial</option>
            <option value="MeshPhysicalMaterial" ${
              lastMaterialTypeRef.current === 'MeshPhysicalMaterial' ? 'selected' : ''
            }>MeshPhysicalMaterial</option>
<!--            <option value="MeshDistanceMaterial">MeshDistanceMaterial</option>-->
            <option value="MeshNormalMaterial" ${
              lastMaterialTypeRef.current === 'MeshNormalMaterial' ? 'selected' : ''
            }>MeshNormalMaterial</option>
            <option value="MeshMatcapMaterial" ${
              lastMaterialTypeRef.current === 'MeshMatcapMaterial' ? 'selected' : ''
            }>MeshMatcapMaterial</option>
            <option value="MeshToonMaterial" ${
              lastMaterialTypeRef.current === 'MeshToonMaterial' ? 'selected' : ''
            }>MeshToonMaterial</option>
            <option value="MeshDepthMaterial" ${
              lastMaterialTypeRef.current === 'MeshDepthMaterial' ? 'selected' : ''
            }>MeshDepthMaterial</option>
<!--            <option value="RawShaderMaterial">RawShaderMaterial</option>-->
            <option value="ShaderMaterial" ${
              lastMaterialTypeRef.current === 'ShaderMaterial' ? 'selected' : ''
            }>ShaderMaterial</option>
            <option value="ShadowMaterial" ${
              lastMaterialTypeRef.current === 'ShadowMaterial' ? 'selected' : ''
            }>ShadowMaterial</option>
          </select>
        </label>
      </div>
    `;
    }

    content.innerHTML += `
      <div class="formRow">
        <label>
          <span>Destroy current material</span>
          <input type="checkbox" class="destroyCurrentMaterial" data-map="destroyCurrentMaterial" ${
            lastDestroyCurrentMaterialRef.current ? 'checked' : ''
          } />
        </label>
      </div>
      <div class="formRow">
        <label>
          <span>Destroy current material textures</span>
          <input type="checkbox" class="destroyCurrentMaterialTextures" data-map="destroyCurrentMaterialTextures" ${
            lastDestroyCurrentMaterialTexturesRef.current ? 'checked' : ''
          } />
        </label>
      </div>
    `;

    content.innerHTML += `
      <div class="formRow">
        <label>
          <button class="submit" data-map="submit">Apply</button>
        </label>
      </div>
    `;

    content.innerHTML += `
      </div>
    `;
  }, [newMaterialFormIsOpen, objects, material]);

  return (
    <Modal isOpen={newMaterialFormIsOpen} onClose={handleClose} title={material?.constructor.name} width="280px">
      {contentRef.current}
    </Modal>
  );
};

import { useAppStore } from 'src/store';
import { Modal } from 'components/Modal/Modal';
import { useCallback, useEffect, useRef } from 'react';
import patchThree from 'lib/patchThree';
import { getMapsKeysForMaterial } from 'lib/utils/materialUtils';
import { createFakeTexture } from 'lib/utils/textureUtils';
import './MaterialEditForm.css';

export const MaterialEditForm = () => {
  const materialEditFormIsOpen = useAppStore((state) => state.materialEditFormIsOpen);
  const setMaterialEditFormIsOpen = useAppStore((state) => state.setMaterialEditFormIsOpen);
  const material = patchThree.materialToEdit!;
  const contentRef = useRef<HTMLDivElement | null>(null);

  const handleClose = useCallback(() => {
    setMaterialEditFormIsOpen(false);
  }, [setMaterialEditFormIsOpen]);

  useEffect(() => {
    const content = document.createElement('div');
    content.id = 'materialEditForm';
    contentRef.current = content;

    return () => {
      contentRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!contentRef.current || !material) return;

    const content = contentRef.current;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const dataMap = target.getAttribute('data-map');
      if (!dataMap) return;
      const isChecked = (target as HTMLInputElement).checked;

      if (isChecked) {
        if ((material as any)[`bck_${dataMap}`]) {
          (material as any)[dataMap] = (material as any)[`bck_${dataMap}`];
          delete (material as any)[`bck_${dataMap}`];
        } else {
          (material as any)[dataMap] = createFakeTexture(dataMap, material);
        }
      } else {
        if ((material as any)[dataMap]) {
          (material as any)[`bck_${dataMap}`] = (material as any)[dataMap];
          // (material as any)[dataMap].dispose();
          delete (material as any)[dataMap];
        }
      }
      material.needsUpdate = true;
      useAppStore.getState().triggerCPanelStateChanged();
    };

    content.addEventListener('click', handleClick);

    return () => {
      content.removeEventListener('click', handleClick);
    };
  }, [material]);

  useEffect(() => {
    if (!contentRef.current || !material) return;

    const content = contentRef.current;

    const maps = getMapsKeysForMaterial(material);

    content.innerHTML = `
      <div>
    `;

    maps.forEach((map) => {
      content.innerHTML += `
        <div class="formRow inline">
          <label>
            <span>${map.name}</span>
            <input type="checkbox" class="${map.name}" data-map="${map.name}" ${map.present ? 'checked' : ''} />
          </label>
        </div>
      `;
    });

    content.innerHTML += `
      </div>
    `;
  }, [materialEditFormIsOpen, material]);

  return (
    <Modal isOpen={materialEditFormIsOpen} onClose={handleClose} title={material?.constructor.name} width="280px">
      {contentRef.current}
    </Modal>
  );
};

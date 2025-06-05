import { useAppStore } from 'src/store';
import { Modal } from 'components/Modal/Modal';
import { useCallback, useEffect, useRef } from 'react';
import './DeleteSelectedObjectConfirmationForm.css';
import { deepClean } from 'lib/utils/cleanUp';

const upperFirstChar = (str: string) => str[0].toUpperCase() + str.slice(1);

export const DeleteSelectedObjectConfirmationForm = () => {
  const deleteModelConfirmationFormIsOpen = useAppStore((state) => state.deleteModelConfirmationFormIsOpen);
  const setDeleteModelConfirmationFormIsOpen = useAppStore((state) => state.setDeleteModelConfirmationFormIsOpen);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const selectedObject = useAppStore.getState().getSelectedObject();
  const checkedMapRef = useRef<Record<string, boolean>>({});

  const handleClose = useCallback(() => {
    setDeleteModelConfirmationFormIsOpen(false);
  }, [setDeleteModelConfirmationFormIsOpen]);

  useEffect(() => {
    const content = document.createElement('div');
    content.id = 'deleteSelectedModelConfirmationForm';
    contentRef.current = content;

    return () => {
      contentRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!contentRef.current || !selectedObject) return;

    const content = contentRef.current;

    const handleClick = (_event: MouseEvent) => {
      const target = _event.target as HTMLInputElement;
      const dataMap = target.getAttribute('data-map');

      if (!dataMap) return;

      if (dataMap === 'delete') {
        const options = {
          ...checkedMapRef.current,
          log: true
        };

        selectedObject.removeFromParent();
        deepClean(selectedObject, options);
      }
    };

    const handleChange = (_event: Event) => {
      const target = _event.target as HTMLInputElement;
      const dataMap = target.getAttribute('data-map');

      if (!dataMap) return;

      const isChecked = target.checked;
      checkedMapRef.current[dataMap] = isChecked;
    };

    content.addEventListener('click', handleClick);
    content.addEventListener('change', handleChange);

    return () => {
      content.removeEventListener('click', handleClick);
      content.removeEventListener('change', handleChange);
    };
  }, [setDeleteModelConfirmationFormIsOpen, selectedObject]);

  useEffect(() => {
    if (!contentRef.current || !selectedObject) return;

    const content = contentRef.current;

    content.innerHTML = `
      <div>
    `;

    const { fullStats } = deepClean(selectedObject, {
      disposeGeometries: false,
      disposeMaterials: false,
      disposeTextures: false,
      disposeSkeletons: false,
      disposeOtherDisposables: false,
      disposeRenderTargets: false,
      log: false
    });

    Object.keys(fullStats).forEach((key) => {
      const value = fullStats[key as keyof typeof fullStats];
      if (value === 0) return;
      const upperKey = upperFirstChar(key);
      const dataMap = `dispose${upperKey}`;
      checkedMapRef.current[dataMap] = true;
      content.innerHTML += `
        <div class="formRow inline">
          <label>
            <span>Dispose ${upperKey} (${value})</span>
            <input type="checkbox" class="${key}" data-map="${dataMap}" checked />
          </label>
        </div>
      `;
    });

    content.innerHTML += `
      <div class="formRow">
        <label>
          <button data-map="delete">Delete</button>
        </label>
      </div>
    `;

    content.innerHTML += `
      </div>
    `;
  }, [deleteModelConfirmationFormIsOpen, selectedObject]);

  if (!selectedObject) return null;

  return (
    <Modal
      isOpen={deleteModelConfirmationFormIsOpen}
      onClose={handleClose}
      title={`Delete ${selectedObject?.name || selectedObject?.uuid}`}
      width="280px"
    >
      {contentRef.current}
    </Modal>
  );
};

// React component that listens for key presses and calls a callback when a key is pressed.
import { useEffect } from 'react';
import { useAppStore } from 'src/store';

// TODO: implement typing multiple letters ? add minimal custom controls to use in Experience for play/pause

let isMouseDown = false;

export const panelContainer = document.querySelector(
  '#controlPanelContent'
) as HTMLElement;

panelContainer.addEventListener('pointerdown', (_evt) => {
  isMouseDown = true;
});
document.addEventListener('pointerup', () => {
  isMouseDown = false;
});

const getAllMetaPressed = (e: KeyboardEvent) => {
  return e.altKey && e.ctrlKey && e.shiftKey;
};

export function KeyListener() {
  const isEditorMode = useAppStore(
    (state) => state.showGizmos || state.cPanelVisible
  );
  const keysPressed: any = {};

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // console.log('KeyListener handleKeyDown', e.code);
      // prevent sending commands when typing in input fields
      if (document.activeElement?.tagName === 'INPUT' || isMouseDown) return;
      switch (e.code) {
        case 'Space':
          if (!keysPressed[e.code] && (isEditorMode || getAllMetaPressed(e))) {
            e.stopPropagation();
            e.preventDefault(); // to  not interfere with form focused elements and cPanel folder collapsing
            useAppStore.getState().togglePlaying();
          }
          break;
        case 'Backslash':
          !keysPressed[e.code] && useAppStore.getState().toggleFullscreen();
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          !keysPressed[e.code] &&
            useAppStore.getState().setShiftKeyPressed(true);
          break;
        case 'ControlLeft':
        case 'ControlRight':
          !keysPressed[e.code] &&
            useAppStore.getState().setControlKeyPressed(true);
          break;
      }
      keysPressed[e.code] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // console.log('KeyListener handleKeyUp', e.code);
      if (document.activeElement?.tagName === 'INPUT' || isMouseDown) return;
      keysPressed[e.code] = false;
      switch (e.code) {
        case 'KeyP':
          if (getAllMetaPressed(e))
            useAppStore.getState().toggleCPanelVisibility();
          break;
        case 'KeyG':
          if (getAllMetaPressed(e)) useAppStore.getState().toggleShowGizmos();
          break;
        case 'KeyH':
          if (getAllMetaPressed(e)) useAppStore.getState().toggleShowHelpers();
          break;
        case 'Space':
          if (isEditorMode || getAllMetaPressed(e)) {
            e.stopPropagation();
            e.preventDefault(); // to  not interfere with form focused elements and cPanel folder collapsing
          }
          break;
        case 'KeyU':
          isEditorMode && useAppStore.getState().toggleCPanelContinuousUpdate();
          break;
        case 'KeyN':
          isEditorMode && useAppStore.getState().toggleCameraControl();
          break;
        // Transform Controls
        case 'Comma':
          isEditorMode &&
            useAppStore.getState().setTransformControlsMode('translate');
          break;
        case 'Period':
          isEditorMode &&
            useAppStore.getState().setTransformControlsMode('rotate');
          break;
        case 'Slash':
          isEditorMode &&
            useAppStore.getState().setTransformControlsMode('scale');
          break;
        case 'Semicolon':
          isEditorMode &&
            useAppStore.getState().setTransformControlsSpace('world');
          break;
        case 'Quote':
          isEditorMode &&
            useAppStore.getState().setTransformControlsSpace('local');
          break;
        case 'KeyC':
          isEditorMode && useAppStore.getState().toggleCameraType();
          break;
        case 'BracketRight':
          isEditorMode &&
            useAppStore
              .getState()
              .toggleAttachDefaultControllersToPlayingCamera();
          break;
        case 'BracketLeft':
          isEditorMode && useAppStore.getState().toggleAngleFormat();
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          useAppStore.getState().setShiftKeyPressed(false);
          break;
        case 'ControlLeft':
        case 'ControlRight':
          useAppStore.getState().setControlKeyPressed(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isEditorMode]);
  return null;
}
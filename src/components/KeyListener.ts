// React component that listens for key presses and calls a callback when a key is pressed.
import { useEffect, useMemo } from 'react';
import { useAppStore } from 'src/store';

// TODO: implement typing multiple letters ? add minimal custom controls to use in Experience for play/pause

let isMouseDown = false;

const handleMouseDown = (_e: MouseEvent) => {
  isMouseDown = true;
};
const handleMouseUp = (_e: MouseEvent) => {
  isMouseDown = false;
};

const getAllMetaPressed = (e: KeyboardEvent) => {
  return e.altKey && e.ctrlKey && e.shiftKey;
};

export function KeyListener() {
  const cPanelVisible = useAppStore((state) => state.cPanelVisible);
  const isEditorMode = useAppStore((state) => state.showGizmos || state.cPanelVisible);
  const isInjected = useAppStore((state) => state.isInjected);
  const isPlaying = useAppStore((state) => state.playingState !== 'stopped');
  // const { scene, camera } = useThree();
  const keysPressed: any = useMemo(() => ({}), []);

  useEffect(() => {
    const panelContainer = document.querySelector('#controlPanelContent') as HTMLElement;
    panelContainer.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      panelContainer.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // console.log('KeyListener handleKeyDown', e.code);
      // prevent sending commands when typing in input fields
      // @ts-ignore
      if (document.activeElement?.type === 'text' || isMouseDown || isPlaying) return;
      switch (e.code) {
        case 'Backslash':
          !keysPressed[e.code] && useAppStore.getState().toggleFullscreen();
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          !keysPressed[e.code] && useAppStore.getState().setShiftKeyPressed(true);
          break;
        case 'ControlLeft':
        case 'ControlRight':
          !keysPressed[e.code] && useAppStore.getState().setControlKeyPressed(true);
          break;
      }
      keysPressed[e.code] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // console.log('KeyListener handleKeyUp', e.code);
      if (document.activeElement?.tagName === 'INPUT' || isMouseDown || isPlaying) return;
      keysPressed[e.code] = false;
      switch (e.code) {
        case 'KeyP':
          if (getAllMetaPressed(e)) useAppStore.getState().toggleCPanelVisibility();
          break;
        case 'KeyG':
          if (cPanelVisible || getAllMetaPressed(e)) useAppStore.getState().toggleShowGizmos();
          break;
        case 'KeyH':
          if (cPanelVisible || getAllMetaPressed(e)) useAppStore.getState().toggleShowHelpers();
          break;
        case 'KeyU':
          isEditorMode && useAppStore.getState().toggleCPanelContinuousUpdate();
          break;
        // Transform Controls
        case 'Comma':
          isEditorMode && useAppStore.getState().setTransformControlsMode('translate');
          break;
        case 'Period':
          isEditorMode && useAppStore.getState().setTransformControlsMode('rotate');
          break;
        case 'Slash':
          isEditorMode && useAppStore.getState().setTransformControlsMode('scale');
          break;
        case 'Semicolon':
          isEditorMode && useAppStore.getState().setTransformControlsSpace('world');
          break;
        case 'Quote':
          isEditorMode && useAppStore.getState().setTransformControlsSpace('local');
          break;
        case 'KeyC':
          isEditorMode && !isInjected && useAppStore.getState().toggleCameraType();
          break;
        case 'BracketRight':
          isEditorMode && !isInjected && useAppStore.getState().toggleAttachDefaultControllersToPlayingCamera();
          break;
        case 'BracketLeft':
          isEditorMode && useAppStore.getState().toggleAngleFormat();
          break;
        case 'Delete':
          isEditorMode && useAppStore.getState().deleteSelectedObject();
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
  }, [isEditorMode, cPanelVisible, isInjected, keysPressed, isPlaying]);
  return null;
}

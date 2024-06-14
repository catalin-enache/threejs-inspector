import React, { memo, useMemo } from 'react';
import * as THREE from 'three';
import { extend, createRoot, events } from '@react-three/fiber';
import { SetUp } from './App/SetUp/SetUp'; // patching Object3D
import { CPanel } from './App/CPanel/CPanel';
import { CustomControl } from 'components/CustomControl/CustomControl';
// KeyListener depends on CPanel (sideEffect) to add in DOM CPanel elements to listen to
import { KeyListener } from './App/KeyListener';
import { useAppStore } from 'src/store';
// extend(THREE);

// singleton
let root;
let version = 0;

export const Inspector = memo(
  ({ orbitControls, autoNavControls, customParams, customControls, onCustomParamsChange, version = 0 }) => {
    const cPanelCustomParamsStateFake = useAppStore((state) => state.cPanelCustomParamsStateFake);
    const triggerCPanelCustomParamsChanged = useAppStore((state) => state.triggerCPanelCustomParamsChanged);

    const customParamsElements = useMemo(() => {
      if (!customParams || !customControls) return null;
      return Object.keys(customControls)
        .map((key, index) => {
          const { onChange } = customControls[key];
          const value = customParams[key];
          if (value === undefined) {
            return;
          }
          return (
            <CustomControl
              key={key}
              name={key}
              value={value}
              control={customControls[key]}
              onChange={(value) => {
                customParams[key] = value;
                onChange?.(value);
                onCustomParamsChange?.(key, value);
                // Updates CustomControl value in this change rather than making 2 updates in the next change.
                // Without this it still works but at every 2 changes the number of updates will be doubled.
                triggerCPanelCustomParamsChanged();
              }}
            />
          );
        })
        .filter(Boolean);
    }, [customParams, customControls, cPanelCustomParamsStateFake, version]);

    return (
      <>
        <SetUp orbitControls={orbitControls} isInjected={true} autoNavControls={autoNavControls} />
        <CPanel />
        <KeyListener isInjected={true} autoNavControls={autoNavControls} />
        {customParamsElements}
      </>
    );
  }
);

export const injectInspector = ({
  renderer: gl,
  scene,
  camera,
  frameloop = 'never', // 'always' | 'demand' | 'never'
  orbitControls,
  autoNavControls,
  customParams,
  customControls,
  onCustomParamsChange
} = {}) => {
  const canvasElement = document.querySelector('canvas');
  if (!canvasElement) {
    throw new Error('No canvas element found');
  }

  root = root || createRoot(canvasElement);
  root.configure({
    events,
    camera,
    scene,
    gl,
    frameloop
  });

  root.render(
    React.createElement(Inspector, {
      orbitControls,
      frameloop,
      autoNavControls,
      customParams,
      customControls,
      onCustomParamsChange,
      version: ++version
    })
  );

  return {
    unmountInspector() {
      root.unmount();
      root = null;
    },
    updateCustomParams() {
      root.render(
        React.createElement(Inspector, {
          orbitControls,
          frameloop,
          autoNavControls,
          customParams,
          customControls,
          onCustomParamsChange,
          version: ++version
        })
      );
    }
  };
};

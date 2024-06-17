import React, { memo, useMemo } from 'react';
import * as THREE from 'three';
import { extend, createRoot, events } from '@react-three/fiber';
import { SetUp } from './App/SetUp/SetUp'; // patching Object3D
import { CPanel } from './App/CPanel/CPanel';
import { CustomControl } from 'components/CustomControl/CustomControl';
// KeyListener depends on CPanel (sideEffect) to add in DOM CPanel elements to listen to
import { KeyListener } from './App/KeyListener';
// extend(THREE);

// singleton
let root;
let version = 0;

export const buildCustomParamsElements = ({ customParams, pathArray = [] }) => {
  return Object.keys(customParams)
    .map((controlName) => {
      const isBinding = !!customParams[controlName].object;
      const isFolder = !isBinding;

      if (isFolder) {
        pathArray.push(controlName);
        return buildCustomParamsElements({
          customParams: customParams[controlName],
          pathArray
        });
      } else {
        const { object, prop, control } = customParams[controlName];
        return (
          <CustomControl
            key={controlName}
            name={controlName}
            object={object}
            prop={prop}
            path={pathArray.join('/')}
            control={control}
          />
        );
      }
    })
    .flat(Infinity)
    .filter(Boolean);
};

export const Inspector = memo(({ orbitControls, autoNavControls, customParams, version = 0 }) => {
  const customParamsElements = useMemo(() => {
    if (!customParams) return null;
    return buildCustomParamsElements({ customParams });
  }, [customParams, version]);

  return (
    <>
      <SetUp orbitControls={orbitControls} isInjected={true} autoNavControls={autoNavControls} />
      <CPanel />
      <KeyListener isInjected={true} autoNavControls={autoNavControls} />
      {customParamsElements}
    </>
  );
});

export const injectInspector = ({
  renderer: gl,
  scene,
  camera,
  frameloop = 'never', // 'always' | 'demand' | 'never'
  orbitControls,
  autoNavControls,
  customParams
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
          version: ++version
        })
      );
    }
  };
};

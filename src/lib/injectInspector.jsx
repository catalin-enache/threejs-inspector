import React, { memo, MouseEvent } from 'react';
import * as THREE from 'three';
import { extend, createRoot, events } from '@react-three/fiber';
import { SetUp } from './App/SetUp/SetUp'; // patching Object3D
import { CPanel } from './App/CPanel/CPanel';
// KeyListener depends on CPanel (sideEffect) to add in DOM CPanel elements to listen to
import { KeyListener } from './App/KeyListener';
// extend(THREE);

const preventContextMenu = (evt) => {
  evt.preventDefault();
};

const App = memo(({ orbitControls, autoNavControls }) => {
  return (
    <>
      <SetUp orbitControls={orbitControls} isInjected={true} autoNavControls={autoNavControls} />
      <CPanel />
      <KeyListener isInjected={true} autoNavControls={autoNavControls} />
    </>
  );
});

// singleton
let root;

export const injectInspector = ({
  renderer: gl,
  scene,
  camera,
  frameloop = 'never', // 'always' | 'demand' | 'never'
  orbitControls,
  autoNavControls
} = {}) => {
  const canvasElement = document.querySelector('canvas');
  if (!canvasElement) {
    throw new Error('No canvas element found');
  }
  canvasElement.removeEventListener('contextmenu', preventContextMenu);
  canvasElement.addEventListener('contextmenu', preventContextMenu);
  root = root || createRoot(canvasElement);
  root.configure({
    events,
    camera,
    scene,
    gl,
    frameloop
  });

  root.render(
    React.createElement(App, {
      orbitControls,
      frameloop,
      autoNavControls
    })
  );
};

import * as THREE from 'three';
import { useMemo, useEffect, useState, useRef } from 'react';
import { RootState, useFrame } from '@react-three/fiber';
import { _XRFrame } from '@react-three/fiber/dist/declarations/src/core/utils';
import { AppStore, useAppStore } from 'src/store';
import { SetUp, SetUpProps } from 'components/SetUp/SetUp';
import { CPanel, CPanelProps } from 'components/CPanel/CPanel';
import { KeyListener } from 'components/KeyListener';
import patchThree from './patchThree';

const { getCurrentScene } = patchThree;

let lastState: RootState;
let lastXFrame: _XRFrame;
const noop = (_playingState: AppStore['playingState'], _state: RootState, _delta: number, _xrFrame?: _XRFrame) => {
  lastState = _state;
  lastXFrame = _xrFrame;
};

export const usePlay = (
  callback: (playingState: AppStore['playingState'], state: RootState, delta: number, xrFrame?: _XRFrame) => void,
  renderPriority = 0,
  deps: any[] = []
) => {
  const playingState = useAppStore((state) => state.playingState);

  const depsRef = useRef(deps);
  const callbackRef = useRef(callback);
  const playingStateRef = useRef(playingState);

  // if deps changed update callback
  for (let i = 0; i < deps.length; i++) {
    if (deps[i] !== depsRef.current[i]) {
      callbackRef.current = callback;
      break;
    }
  }

  const playingStateChanged = playingState !== playingStateRef.current;

  depsRef.current = deps;
  playingStateRef.current = playingState;

  const boundCallback = useMemo(
    () => callbackRef.current.bind(null, playingState),
    [callbackRef.current, playingState]
  );
  const boundNoop = useMemo(() => noop.bind(null, playingState), [playingState]);

  if (playingStateChanged && ['paused', 'stopped'].includes(playingState) && lastState) {
    boundCallback(lastState, 0, lastXFrame);
  }

  useFrame(playingState === 'playing' ? boundCallback : boundNoop, renderPriority);
};

type UseInspector = ({
  cameraType,
  onSetupEffect,
  onThreeChange,
  onCPanelReady,
  onCPanelUnmounted
}: {
  cameraType?: 'perspective' | 'orthographic';
  // for testing
  onSetupEffect?: SetUpProps['onSetupEffect'];
  onThreeChange?: SetUpProps['onThreeChange'];
  onCPanelReady?: CPanelProps['onCPanelReady'];
  onCPanelUnmounted?: CPanelProps['onCPanelUnmounted'];
}) => {
  camera?: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  scene: THREE.Scene;
  inspector: JSX.Element;
};

// Note: when using useDefaultSetup hook, the App !MUST! use the scene and camera from the hook.
// If that's not desired do not use useDefaultSetup hook but inject the <Inspector /> component instead.
export const useDefaultSetup: UseInspector = ({
  cameraType,
  onSetupEffect,
  onThreeChange,
  onCPanelReady,
  onCPanelUnmounted
} = {}) => {
  const currentCameraStateFake = useAppStore((state) => state.currentCameraStateFake);
  const [camera, setCamera] = useState(getCurrentScene().__inspectorData.currentCamera);

  useEffect(() => {
    if (cameraType) {
      useAppStore.getState().setCameraType(cameraType);
    }
  }, [cameraType]);

  // cameraType in SetUp drives the currentCameraStateFake change
  useEffect(() => {
    setCamera(getCurrentScene().__inspectorData.currentCamera);
  }, [currentCameraStateFake]);

  const inspector = useMemo(() => {
    return (
      <>
        <SetUp isInjected={false} autoNavControls={true} onSetupEffect={onSetupEffect} onThreeChange={onThreeChange} />
        <CPanel onCPanelReady={onCPanelReady} onCPanelUnmounted={onCPanelUnmounted} />
        <KeyListener />
      </>
    );
  }, []);

  return {
    camera,
    scene: getCurrentScene(),
    inspector
  };
};

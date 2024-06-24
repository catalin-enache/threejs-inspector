import { useMemo } from 'react';
import { RootState, useFrame } from '@react-three/fiber';
import { _XRFrame } from '@react-three/fiber/dist/declarations/src/core/utils';
import { AppStore, useAppStore } from 'src/store';
import { useEffect, useState } from 'react';
import { currentScene, SetUp } from 'lib/App/SetUp/SetUp';
import { CPanel } from 'lib/App/CPanel/CPanel';
import { KeyListener } from 'lib/App/KeyListener';

let lastState: RootState;
let lastXFrame: _XRFrame;
const noop = (_playingState: AppStore['playingState'], _state: RootState, _delta: number, _xrFrame?: _XRFrame) => {
  lastState = _state;
  lastXFrame = _xrFrame;
};

export const usePlay = (
  callback: (playingState: AppStore['playingState'], state: RootState, delta: number, xrFrame?: _XRFrame) => void,
  renderPriority = 0
) => {
  const playingState = useAppStore((state) => state.playingState);
  const boundCallback = useMemo(() => callback.bind(null, playingState), [callback, playingState]);
  const boundNoop = useMemo(() => noop.bind(null, playingState), [playingState]);
  if (['paused', 'stopped'].includes(playingState) && lastState) {
    boundCallback(lastState, 0, lastXFrame);
  }
  useFrame(playingState === 'playing' ? boundCallback : boundNoop, renderPriority);
};

export const useDefaultScene = () => {
  const currentCameraStateFake = useAppStore((state) => state.currentCameraStateFake);
  const [camera, setCamera] = useState(currentScene.__inspectorData.currentCamera);

  useEffect(() => {
    setCamera(currentScene.__inspectorData.currentCamera);
  }, [currentCameraStateFake]);

  const inspector = useMemo(
    () => (
      <>
        <SetUp isInjected={false} autoNavControls />
        <CPanel />
        <KeyListener isInjected={false} autoNavControls />
      </>
    ),
    []
  );

  return {
    camera,
    scene: currentScene,
    inspector
  };
};

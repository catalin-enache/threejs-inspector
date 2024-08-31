import { useMemo } from 'react';
import { RootState, useFrame } from '@react-three/fiber';
import { _XRFrame } from '@react-three/fiber/dist/declarations/src/core/utils';
import { AppStore, useAppStore } from 'src/store';
import { useEffect, useState } from 'react';
import { getCurrentScene, SetUp } from 'lib/App/SetUp/SetUp';
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

export const useInspector = () => {
  const currentCameraStateFake = useAppStore((state) => state.currentCameraStateFake);
  const currentSceneStateFake = useAppStore((state) => state.currentSceneStateFake);
  const [camera, setCamera] = useState(getCurrentScene().__inspectorData.currentCamera);
  const [scene, setScene] = useState(getCurrentScene());

  useEffect(() => {
    setCamera(getCurrentScene().__inspectorData.currentCamera);
  }, [currentCameraStateFake]);

  // TODO: why wold we need to listen to scene change since useInspector is only used in the main App ?
  // and in a normal scenario a scene will change when another app is injecting the inspector.
  // related to TODO in SetUp => setCurrentScene
  useEffect(() => {
    setScene(getCurrentScene());
  }, [currentSceneStateFake]);

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
    scene,
    inspector
  };
};

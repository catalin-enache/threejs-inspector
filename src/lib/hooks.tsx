import { useMemo } from 'react';
import { RootState, useFrame } from '@react-three/fiber';
import { _XRFrame } from '@react-three/fiber/dist/declarations/src/core/utils';
import { useAppStore } from 'src/store';
import { useEffect, useState } from 'react';
import { currentScene, SetUp } from 'lib/App/SetUp/SetUp';
import { CPanel } from 'lib/App/CPanel/CPanel';
import { KeyListener } from 'lib/App/KeyListener';

const noop = () => {};

export const usePlay = (
  callback: (state: RootState, delta: number, xrFrame?: _XRFrame) => void,
  renderPriority = 0
) => {
  const isPlaying = useAppStore((state) => state.isPlaying);
  useFrame(isPlaying ? callback : noop, renderPriority);
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

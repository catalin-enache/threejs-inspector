import * as THREE from 'three';
import { useMemo, useEffect, useState, useRef, JSX } from 'react';
import { RootState, useFrame } from '@react-three/fiber';
import { type AppStore, useAppStore } from 'src/store';
import { SetUp, SetUpProps } from 'components/SetUp/SetUp';
import { CPanel, type CPanelProps } from 'components/CPanel/CPanel';
import { KeyListener } from 'components/KeyListener';
import patchThree from './patchThree';
// import { getCPanel } from 'lib/utils/lazyLoaders';

const { getCurrentScene, getCurrentCamera } = patchThree;

let lastState: RootState;
let lastXFrame: XRFrame | undefined;
const noop = (_playingState: AppStore['playingState'], _state: RootState, _delta: number, _xrFrame?: XRFrame) => {
  lastState = _state;
  lastXFrame = _xrFrame;
};

/**
 * usePlay hook allows to run a callback on every frame when the app is in 'playing' state.
 * It also provides the current playing state, which can be 'playing', 'paused', or 'stopped'.
 * The state can be set using the api.setPlayingState and read from api.getPlayingState.
 * api.registerDefaultPlayTriggers (space & backspace) is also provided for convenience.
 */
export const usePlay = (
  callback: (playingState: AppStore['playingState'], state: RootState, delta: number, xrFrame?: XRFrame) => void,
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

  // const boundCallbackRef = useRef(boundCallback);
  // const boundNoopRef = useRef(boundNoop);
  // const _cbRef = useRef((_state: RootState, _delta: number, _xrFrame?: _XRFrame) => {
  //   playingStateRef.current === 'playing'
  //     ? boundCallbackRef.current(_state, _delta, _xrFrame)
  //     : boundNoopRef.current(_state, _delta, _xrFrame);
  // });

  // useFrame(_cbRef.current, renderPriority);
};

type DefaultSetup = (config: {
  cameraType?: 'perspective' | 'orthographic';
  autoNavControls?: AppStore['autoNavControls'];
  showInspector?: boolean;
  showGizmos?: boolean;
  useTransformControls?: boolean;
  onTransformControlsDragging?: (isDragging: boolean) => void;
  onPlayingStateChange?: (playingState: AppStore['playingState']) => void;
  // for testing
  onSetupEffect?: SetUpProps['onSetupEffect'];
  onThreeChange?: SetUpProps['onThreeChange'];
  onCPanelReady?: CPanelProps['onCPanelReady'];
  onCPanelUnmounted?: CPanelProps['onCPanelUnmounted'];
}) => {
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  scene: THREE.Scene;
  inspector: JSX.Element;
};

// Note: when using useDefaultSetup hook, the App !MUST! use the scene and camera from the hook.
// If that's not desired do not use useDefaultSetup hook but inject the <Inspector /> component instead.
export const useDefaultSetup: DefaultSetup = ({
  cameraType,
  autoNavControls = 'always',
  showInspector = true,
  showGizmos = true,
  useTransformControls = true,
  onTransformControlsDragging = () => {},
  onPlayingStateChange = () => {},
  onSetupEffect,
  onThreeChange,
  onCPanelReady,
  onCPanelUnmounted
} = {}) => {
  const currentCameraStateFake = useAppStore((state) => state.currentCameraStateFake);
  const [camera, setCamera] = useState(getCurrentCamera());
  const currentFrameLoopRef = useRef<RootState['frameloop'] | ''>('');

  const isDraggingTransformControls = useAppStore((state) => state.isDraggingTransformControls);
  const onTransformControlsDraggingRef = useRef(onTransformControlsDragging);
  onTransformControlsDraggingRef.current = onTransformControlsDragging;

  const playingState = useAppStore((state) => state.playingState);
  const onPlayingStateChangeRef = useRef(onPlayingStateChange);
  onPlayingStateChangeRef.current = onPlayingStateChange;

  // const [CPanelComponent, setCPanelComponent] = useState<typeof import('components/CPanel/CPanel').CPanel | null>(null);
  //
  // const isMountedRef = useRef(false);
  // useEffect(() => {
  //   isMountedRef.current = true;
  //   return () => {
  //     isMountedRef.current = false;
  //     // onCPanelUnmounted?.();
  //   };
  // }, [onCPanelUnmounted]);
  //
  // useEffect(() => {
  //   if (CPanelComponent || !isMountedRef.current) {
  //     return;
  //   }
  //   getCPanel().then((CPanel) => {
  //     setCPanelComponent(() => CPanel);
  //   });
  // }, [CPanelComponent]);

  useEffect(() => {
    if (cameraType) {
      useAppStore.getState().setCameraType(cameraType);
    }
  }, [cameraType]);

  useEffect(() => {
    useAppStore.getState().setShowGizmos(showGizmos);
  }, [showGizmos]);

  useEffect(() => {
    useAppStore.getState().setUseTransformControls(useTransformControls);
  }, [useTransformControls]);

  // cameraType in SetUp drives the currentCameraStateFake change
  useEffect(() => {
    currentFrameLoopRef.current = patchThree.getThreeRootState()?.frameloop || '';
    setCamera(getCurrentCamera());
  }, [currentCameraStateFake]);

  useEffect(() => {
    patchThree.getThreeRootState()?.setFrameloop?.(currentFrameLoopRef.current || 'always');
  }, [camera]);

  useEffect(() => {
    onTransformControlsDraggingRef.current(isDraggingTransformControls);
  }, [isDraggingTransformControls]);

  useEffect(() => {
    onPlayingStateChangeRef.current(playingState);
  }, [playingState, onPlayingStateChangeRef]);

  // const inspector = useMemo(() => {
  //   return (
  //     <>
  //       <SetUp isInjected={false} autoNavControls={'always'} onSetupEffect={onSetupEffect} onThreeChange={onThreeChange} />
  //       {CPanelComponent && <CPanelComponent onCPanelReady={onCPanelReady} onCPanelUnmounted={onCPanelUnmounted} />}
  //       {CPanelComponent && <KeyListener />}
  //     </>
  //   );
  // }, [CPanelComponent, onCPanelReady, onCPanelUnmounted, onThreeChange, onSetupEffect]);

  const inspector = useMemo(() => {
    return (
      <>
        <SetUp
          isInjected={false}
          autoNavControls={autoNavControls}
          onSetupEffect={onSetupEffect}
          onThreeChange={onThreeChange}
        />
        {showInspector && <CPanel onCPanelReady={onCPanelReady} onCPanelUnmounted={onCPanelUnmounted} />}
        <KeyListener />
      </>
    );
  }, [onCPanelReady, onCPanelUnmounted, onThreeChange, onSetupEffect, showInspector, autoNavControls]);

  return {
    camera,
    scene: getCurrentScene(),
    inspector
  };
};

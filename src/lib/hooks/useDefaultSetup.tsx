import * as THREE from 'three';
import { useMemo, useEffect, useState, useRef, JSX } from 'react';
import { RootState } from '@react-three/fiber';
import { type AppStore, useAppStore } from 'src/store';
import { SetUp, SetUpProps } from 'components/SetUp/SetUp';
import { CPanel, type CPanelProps } from 'components/CPanel/CPanel';
import { KeyListener } from 'components/KeyListener';
import patchThree from 'src/lib/patchThree';
// import { getCPanel } from 'lib/utils/lazyLoaders';

const { getCurrentScene, getCurrentCamera } = patchThree;

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

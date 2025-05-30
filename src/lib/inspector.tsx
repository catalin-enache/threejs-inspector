import * as THREE from 'three';
import { ReactNode, memo, useMemo, createElement, useEffect, useRef } from 'react';
// import { useState, useEffect } from 'react';
import {
  extend,
  createRoot,
  events,
  ReconcilerRoot,
  useFrame,
  RenderCallback,
  useThree,
  RootState
} from '@react-three/fiber';
import { SetUp, SetUpProps, SETUP_EFFECT } from 'components/SetUp/SetUp'; // patching Object3D
import { CPanel, type CPanelProps } from 'components/CPanel/CPanel';
import { CustomControl } from 'components/CustomControl/CustomControl';
import { CustomParams, isCustomParamStruct } from 'lib/customParam.types';
// KeyListener depends on CPanel (sideEffect) to add in DOM CPanel elements to listen to
import { KeyListener } from 'components/KeyListener';
import { type AppStore, useAppStore } from 'src/store';
import { usePlay } from 'lib/hooks';
// import { getCPanel } from 'lib/utils/lazyLoaders';
extend(THREE as any);

// singleton
let root: ReconcilerRoot<HTMLCanvasElement> | null;
let version = 0;

type buildCustomParamsElementsParams = {
  customParams: CustomParams;
  pathArray?: string[];
};

export interface BaseInspectorProps {
  autoNavControls?: AppStore['autoNavControls'];
  customParams?: CustomParams;
  showInspector?: boolean;
  showGizmos?: boolean;
  useTransformControls?: boolean;
  onRender?: RenderCallback;
  onPlay?: Parameters<typeof usePlay>[0];
  onTransformControlsDragging?: (isDragging: boolean) => void;
  onPlayingStateChange?: (playingState: AppStore['playingState']) => void;
  r3fThreeGetSet?: ({
    r3fThreeGet,
    r3fThreeSet
  }: {
    r3fThreeGet: RootState['get'];
    r3fThreeSet: RootState['set'];
  }) => void;
  // for testing
  onSetupEffect?: SetUpProps['onSetupEffect'];
  onThreeChange?: SetUpProps['onThreeChange'];
  onCPanelReady?: CPanelProps['onCPanelReady'];
  onCPanelUnmounted?: CPanelProps['onCPanelUnmounted'];
}

export const buildCustomParamsElements = ({
  customParams,
  pathArray = []
}: buildCustomParamsElementsParams): ReactNode => {
  return Object.keys(customParams)
    .map((controlName) => {
      if (isCustomParamStruct(customParams[controlName])) {
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
      } else {
        return buildCustomParamsElements({
          customParams: customParams[controlName],
          pathArray: [...pathArray, controlName]
        });
      }
    })
    .flat(Infinity)
    .filter(Boolean);
};

export interface InspectorProps extends BaseInspectorProps {
  version?: number;
}

export const Inspector = memo(
  ({
    autoNavControls = 'never',
    customParams,
    showInspector = true,
    showGizmos = true,
    useTransformControls = true,
    onRender = () => {},
    onPlay = () => {},
    onTransformControlsDragging = () => {},
    onPlayingStateChange = () => {},
    r3fThreeGetSet,
    onSetupEffect,
    onThreeChange,
    onCPanelReady,
    onCPanelUnmounted,
    version = 0
  }: InspectorProps) => {
    useFrame(onRender);
    usePlay(onPlay);
    const r3fThreeGet = useThree((state) => state.get);
    const r3fThreeSet = useThree((state) => state.set);

    const playingState = useAppStore((state) => state.playingState);
    const onPlayingStateChangeRef = useRef(onPlayingStateChange);
    onPlayingStateChangeRef.current = onPlayingStateChange;

    const isDraggingTransformControls = useAppStore((state) => state.isDraggingTransformControls);
    const onTransformControlsDraggingRef = useRef(onTransformControlsDragging);
    onTransformControlsDraggingRef.current = onTransformControlsDragging;

    const customParamsElements = useMemo(() => {
      !customParams && onSetupEffect?.(SETUP_EFFECT.VERSION_CHANGED, { version, customParamsElements: null });
      if (!customParams) return null;
      const customParamsElements = buildCustomParamsElements({ customParams });
      onSetupEffect?.(SETUP_EFFECT.VERSION_CHANGED, { version, customParamsElements });
      return customParamsElements;
      // updateInspector is called with the same customParams object reference
      // eslint-disable-next-line react-hooks/exhaustive-deps -- version is needed because customParams are mutated
    }, [customParams, version]);

    // const [CPanelComponent, setCPanelComponent] = useState<typeof import('components/CPanel/CPanel').CPanel | null>(
    //   null
    // );
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

    // return (
    //   <>
    //     <SetUp
    //       isInjected={true}
    //       autoNavControls={autoNavControls}
    //       onSetupEffect={onSetupEffect}
    //       onThreeChange={onThreeChange}
    //     />
    //     {CPanelComponent && <CPanelComponent onCPanelReady={onCPanelReady} onCPanelUnmounted={onCPanelUnmounted} />}
    //     {CPanelComponent && <KeyListener />}
    //     {customParamsElements}
    //   </>
    // );

    useEffect(() => {
      r3fThreeGetSet?.({ r3fThreeGet, r3fThreeSet });
    }, [r3fThreeGetSet, r3fThreeGet, r3fThreeSet]);

    useEffect(() => {
      useAppStore.getState().setShowGizmos(showGizmos);
    }, [showGizmos]);

    useEffect(() => {
      useAppStore.getState().setUseTransformControls(useTransformControls);
    }, [useTransformControls]);

    useEffect(() => {
      onTransformControlsDraggingRef.current(isDraggingTransformControls);
    }, [isDraggingTransformControls]);

    useEffect(() => {
      onPlayingStateChangeRef.current(playingState);
    }, [playingState, onPlayingStateChangeRef]);

    return (
      <>
        <SetUp
          isInjected={true}
          autoNavControls={autoNavControls}
          onSetupEffect={onSetupEffect}
          onThreeChange={onThreeChange}
        />
        {showInspector && <CPanel onCPanelReady={onCPanelReady} onCPanelUnmounted={onCPanelUnmounted} />}
        <KeyListener />
        {customParamsElements}
      </>
    );
  }
);

export interface InjectInspectorParams extends BaseInspectorProps {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  frameloop?: RootState['frameloop'];
}

const configureAndRender = (params: InjectInspectorParams) => {
  const {
    renderer,
    scene,
    camera,
    frameloop,
    autoNavControls,
    customParams,
    showInspector,
    showGizmos,
    useTransformControls,
    onRender,
    onPlay,
    onTransformControlsDragging,
    onPlayingStateChange,
    r3fThreeGetSet,
    onSetupEffect,
    onThreeChange,
    onCPanelReady,
    onCPanelUnmounted
  } = params;
  /*
  similar to:
  <canvas camera scene gl frameloop ...>
    <Inspector />
  </canvas>
  */
  root?.configure({
    events,
    camera,
    scene,
    gl: renderer,
    frameloop
  });

  root?.render(
    createElement(Inspector, {
      autoNavControls,
      customParams,
      version: ++version,
      showInspector,
      showGizmos,
      useTransformControls,
      onTransformControlsDragging,
      onPlayingStateChange,
      // for testing
      onSetupEffect,
      onThreeChange,
      onCPanelReady,
      onCPanelUnmounted,
      onRender,
      onPlay,
      r3fThreeGetSet
    })
  );
};

export const injectInspector = (params: InjectInspectorParams) => {
  const canvasElement = params.renderer.domElement;

  root = root || createRoot(canvasElement);
  configureAndRender(params);

  return {
    unmountInspector() {
      version = 0;
      root?.unmount();
      root = null;
    },
    // updateInspector can be called multiple times with different options except scene which can only be set once
    updateInspector(updateParams: Partial<InjectInspectorParams> = {}) {
      configureAndRender({ ...params, ...updateParams });
    }
  };
};

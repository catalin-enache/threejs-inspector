import * as THREE from 'three';
import React, { ReactNode, memo, useMemo } from 'react';
import { extend, createRoot, events, ReconcilerRoot } from '@react-three/fiber';
import { SetUp, SetUpProps, SETUP_EFFECT } from './App/SetUp/SetUp'; // patching Object3D
import { CPanel, CPanelProps } from './App/CPanel/CPanel';
import { CustomControl, CustomControlProps } from 'components/CustomControl/CustomControl';
// KeyListener depends on CPanel (sideEffect) to add in DOM CPanel elements to listen to
import { KeyListener } from './App/KeyListener';
extend(THREE);

// singleton
let root: ReconcilerRoot<HTMLCanvasElement> | null;
let version = 0;

interface CustomParamStruct {
  object: CustomControlProps['object'];
  prop: CustomControlProps['prop'];
  control: CustomControlProps['control'];
}

const isCustomParamStruct = (value: any): value is CustomParamStruct => {
  return value && typeof value === 'object' && 'object' in value && 'prop' in value && 'control' in value;
};

interface CustomParams {
  [key: string]: CustomParamStruct | CustomParams;
}

type buildCustomParamsElementsParams = {
  customParams: CustomParams;
  pathArray?: string[];
};

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

interface InspectorProps {
  // autoNavControls enable OrbitControls and FlyControls
  autoNavControls?: boolean;
  // if orbitControls are provided, they replace internal OrbitControls when autoNavControls is true
  orbitControls?: any;
  customParams?: any;
  version?: number;
  // for testing
  onSetupEffect?: SetUpProps['onSetupEffect'];
  onThreeChange?: SetUpProps['onThreeChange'];
  onCPanelReady?: CPanelProps['onCPanelReady'];
  onCPanelUnmounted?: CPanelProps['onCPanelUnmounted'];
}

export const Inspector = memo(
  ({
    orbitControls,
    autoNavControls = false,
    customParams,
    onSetupEffect,
    onThreeChange,
    onCPanelReady,
    onCPanelUnmounted,
    version = 0
  }: InspectorProps) => {
    const customParamsElements = useMemo(() => {
      !customParams && onSetupEffect?.(SETUP_EFFECT.VERSION_CHANGED, { version, customParamsElements: null });
      if (!customParams) return null;
      const customParamsElements = buildCustomParamsElements({ customParams });
      onSetupEffect?.(SETUP_EFFECT.VERSION_CHANGED, { version, customParamsElements });
      return customParamsElements;
      // updateInspector is called with the same customParams object reference
      // eslint-disable-next-line react-hooks/exhaustive-deps -- version is needed because customParams are mutated
    }, [customParams, version]);

    return (
      <>
        <SetUp
          orbitControls={orbitControls}
          isInjected={true}
          autoNavControls={autoNavControls}
          onSetupEffect={onSetupEffect}
          onThreeChange={onThreeChange}
        />
        <CPanel onCPanelReady={onCPanelReady} onCPanelUnmounted={onCPanelUnmounted} />
        <KeyListener />
        {customParamsElements}
      </>
    );
  }
);

type InjectInspectorParams = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  frameloop?: 'always' | 'demand' | 'never';
  // autoNavControls enable OrbitControls and FlyControls
  autoNavControls?: boolean;
  // if orbitControls are provided, they replace internal OrbitControls when autoNavControls is true
  orbitControls?: any;
  customParams?: any;
  // for testing
  onSetupEffect?: SetUpProps['onSetupEffect'];
  onThreeChange?: SetUpProps['onThreeChange'];
  onCPanelReady?: CPanelProps['onCPanelReady'];
  onCPanelUnmounted?: CPanelProps['onCPanelUnmounted'];
};

const configureAndRender = (params: InjectInspectorParams) => {
  const {
    renderer,
    scene,
    camera,
    frameloop,
    orbitControls,
    autoNavControls,
    customParams,
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
    React.createElement(Inspector, {
      orbitControls,
      autoNavControls,
      customParams,
      version: ++version,
      // for testing
      onSetupEffect,
      onThreeChange,
      onCPanelReady,
      onCPanelUnmounted
    })
  );
};

export const injectInspector = (params: InjectInspectorParams) => {
  const canvasElement = document.querySelector('canvas');
  if (!canvasElement) {
    throw new Error('No canvas element found');
  }

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

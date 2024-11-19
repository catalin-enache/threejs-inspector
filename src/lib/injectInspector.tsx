import * as THREE from 'three';
import React, { ReactNode, memo, useMemo } from 'react';
import { extend, createRoot, events, ReconcilerRoot } from '@react-three/fiber';
import { SetUp, SetUpProps } from './App/SetUp/SetUp'; // patching Object3D
import { CPanel } from './App/CPanel/CPanel';
import { CustomControl } from 'components/CustomControl/CustomControl';
// KeyListener depends on CPanel (sideEffect) to add in DOM CPanel elements to listen to
import { KeyListener } from './App/KeyListener';
extend(THREE);

// singleton
let root: ReconcilerRoot<HTMLCanvasElement> | null;
let version = 0;

type buildCustomParamsElementsParams = {
  customParams: any;
  pathArray?: string[];
};

export const buildCustomParamsElements = ({
  customParams,
  pathArray = []
}: buildCustomParamsElementsParams): ReactNode => {
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

interface InspectorProps {
  orbitControls?: any;
  autoNavControls?: boolean;
  customParams?: any;
  version?: number;
  // for testing
  onSetupEffect?: SetUpProps['onSetupEffect'];
  onThreeChange?: SetUpProps['onThreeChange'];
}

export const Inspector = memo(
  ({
    orbitControls,
    autoNavControls = false,
    customParams,
    onSetupEffect,
    onThreeChange,
    version = 0
  }: InspectorProps) => {
    const customParamsElements = useMemo(() => {
      if (!customParams) return null;
      return buildCustomParamsElements({ customParams });
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
        <CPanel />
        <KeyListener isInjected={true} autoNavControls={autoNavControls} />
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
  orbitControls?: any;
  autoNavControls?: boolean;
  customParams?: any;
};

const configureAndRender = (params: InjectInspectorParams) => {
  const { renderer, scene, camera, frameloop, orbitControls, autoNavControls, customParams } = params;
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
      version: ++version
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
      root?.unmount();
      root = null;
    },
    updateInspector(updateParams: Partial<InjectInspectorParams> = {}) {
      configureAndRender({ ...params, ...updateParams });
    }
  };
};

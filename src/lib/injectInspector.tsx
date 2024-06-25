import * as THREE from 'three';
import React, { ReactNode, memo, useMemo } from 'react';
// @ts-ignore
import { extend, createRoot, events, ReconcilerRoot } from '@react-three/fiber';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { SetUp } from './App/SetUp/SetUp'; // patching Object3D
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
  orbitControls?: OrbitControls | null;
  autoNavControls?: boolean;
  customParams?: any;
  version?: number;
}

export const Inspector = memo(
  ({ orbitControls, autoNavControls = false, customParams, version = 0 }: InspectorProps) => {
    const customParamsElements = useMemo(() => {
      if (!customParams) return null;
      return buildCustomParamsElements({ customParams });
    }, [customParams, version]);

    return (
      <>
        <SetUp orbitControls={orbitControls} isInjected={true} autoNavControls={autoNavControls} />
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
  orbitControls?: OrbitControls | null;
  autoNavControls?: boolean;
  customParams?: any;
};

const configureAndRender = (params: InjectInspectorParams) => {
  const { renderer, scene, camera, frameloop, orbitControls, autoNavControls, customParams } = params;

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

import * as THREE from 'three';
import { ReactNode, memo, useMemo, createElement } from 'react';
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
  autoNavControls?: boolean;
  customParams?: CustomParams;
  useHotKeys?: boolean;
  // for testing
  onSetupEffect?: SetUpProps['onSetupEffect'];
  onThreeChange?: SetUpProps['onThreeChange'];
  onCPanelReady?: CPanelProps['onCPanelReady'];
  onCPanelUnmounted?: CPanelProps['onCPanelUnmounted'];
  onRender?: RenderCallback;
  r3fThreeGetSet?: ({
    r3fThreeGet,
    r3fThreeSet
  }: {
    r3fThreeGet: RootState['get'];
    r3fThreeSet: RootState['set'];
  }) => void;
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
    autoNavControls = false,
    customParams,
    useHotKeys = true,
    onSetupEffect,
    onThreeChange,
    onCPanelReady,
    onCPanelUnmounted,
    version = 0,
    onRender = () => {},
    r3fThreeGetSet
  }: InspectorProps) => {
    useFrame(onRender);
    const r3fThreeGet = useThree((state) => state.get);
    const r3fThreeSet = useThree((state) => state.set);
    r3fThreeGetSet?.({ r3fThreeGet, r3fThreeSet });

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
    //     {CPanelComponent && useHotKeys && <KeyListener />}
    //     {customParamsElements}
    //   </>
    // );
    return (
      <>
        <SetUp
          isInjected={true}
          autoNavControls={autoNavControls}
          onSetupEffect={onSetupEffect}
          onThreeChange={onThreeChange}
        />
        <CPanel onCPanelReady={onCPanelReady} onCPanelUnmounted={onCPanelUnmounted} />
        {useHotKeys && <KeyListener />}
        {customParamsElements}
      </>
    );
  }
);

export interface InjectInspectorParams extends BaseInspectorProps {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  frameloop?: 'always' | 'demand' | 'never';
}

const configureAndRender = (params: InjectInspectorParams) => {
  const {
    renderer,
    scene,
    camera,
    frameloop,
    autoNavControls,
    customParams,
    useHotKeys,
    onSetupEffect,
    onThreeChange,
    onCPanelReady,
    onCPanelUnmounted,
    onRender,
    r3fThreeGetSet
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
      useHotKeys,
      version: ++version,
      // for testing
      onSetupEffect,
      onThreeChange,
      onCPanelReady,
      onCPanelUnmounted,
      onRender,
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

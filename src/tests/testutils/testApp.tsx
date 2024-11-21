import { ReactNode, useMemo, useState, useEffect, useCallback, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, RootState } from '@react-three/fiber';
import { Inspector } from 'lib/injectInspector';
import { OrbitControls } from '@react-three/drei';
import { defaultScene, defaultPerspectiveCamera, defaultOrthographicCamera } from 'lib/App/SetUp/patchThree';
import { SetUpProps } from 'lib/App/SetUp/SetUp';
import { useAppStore } from 'src/store';
import { CPanelProps } from 'lib/App/CPanel/CPanel';
import { useDefaultSetup } from 'lib/hooks';

const styleContent = `
:root {
  font-family: 'Roboto Mono', monospace;
  line-height: 1.5;
  font-weight: 400;

  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
  -webkit-tap-highlight-color: transparent;
}

html, body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  -webkit-user-select: none; /* Safari */
  -ms-user-select: none; /* IE 10 and IE 11 */
  user-select: none; /* Standard syntax */
}

body {
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

body * {
  box-sizing: border-box;
}

#main {
  display: block;
  position: relative;
  width: 100vw;
  height: 100vh;
}
`;

export const initDOM = () => {
  const styleSheet = document.createElement('style');
  styleSheet.innerText = styleContent;
  styleSheet.id = 'test-style';
  document.head.appendChild(styleSheet);
  const main = document.createElement('div');
  main.id = 'main';
  document.body.appendChild(main);
};

export const clearDOM = () => {
  const styleSheet = document.getElementById('test-style');
  const main = document.getElementById('main');
  if (styleSheet) {
    document.head.removeChild(styleSheet);
  }
  if (main) {
    document.body.removeChild(main);
  }
};

const glOptions = { antialias: true, precision: 'highp' };

export interface TestInjectedInspectorAppProps {
  children?: ReactNode;
  useDreiOrbitControls?: boolean;
  autoNavControls?: boolean;
  includeDirLight?: boolean;
  includeFloorPlane?: boolean;
  useDefaultScene?: boolean;
  useDefaultPerspectiveCamera?: boolean;
  useDefaultOrthographicCamera?: boolean;
  onSetupEffect?: SetUpProps['onSetupEffect'];
  onThreeChange?: SetUpProps['onThreeChange'];
  onCPanelReady?: CPanelProps['onCPanelReady'];
}

export function TestInjectedInspectorApp(props: TestInjectedInspectorAppProps) {
  const { scene, camera } = useMemo(() => {
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 12);
    return {
      scene,
      camera
    };
  }, []);

  const {
    children,
    useDreiOrbitControls = false,
    autoNavControls = true,
    includeDirLight = true,
    includeFloorPlane = true,
    useDefaultScene = false,
    useDefaultPerspectiveCamera = false,
    useDefaultOrthographicCamera = false,
    onSetupEffect,
    onThreeChange,
    onCPanelReady
  } = props;
  const [orbitControls, setOrbitControls] = useState<any>(null);
  const threeStateRef = useRef<RootState | null>(null);

  useEffect(() => {
    return () => {
      // reset
      useAppStore.getState().setDestroyOnRemove(true);
      useAppStore.getState().setCameraControl('orbit');
      useAppStore.getState().setAttachDefaultControllersToPlayingCamera(true);
      // should dbe covered by SetUp unmount
      // threeStateRef.current?.gl.dispose();
      // threeStateRef.current?.scene.__inspectorData.orbitControlsRef?.current?.dispose();
    };
  }, []);

  const handleThreeChange = useCallback<NonNullable<SetUpProps['onThreeChange']>>(
    (changed, three) => {
      threeStateRef.current = three;
      onThreeChange && onThreeChange(changed, three);
    },
    [onThreeChange]
  );

  return (
    <Canvas
      camera={
        useDefaultPerspectiveCamera
          ? defaultPerspectiveCamera
          : useDefaultOrthographicCamera
            ? defaultOrthographicCamera
            : camera
      }
      scene={useDefaultScene ? defaultScene : scene}
      shadows={'soft'}
      gl={glOptions}
      frameloop={'always'}
    >
      {/* orbitControls is first null then if useDreiOrbitControls is the one from Drei */}
      <Inspector
        autoNavControls={autoNavControls}
        orbitControls={orbitControls}
        onSetupEffect={onSetupEffect}
        onThreeChange={handleThreeChange}
        onCPanelReady={onCPanelReady}
      />
      {useDreiOrbitControls ? <OrbitControls makeDefault ref={setOrbitControls} enableDamping={false} /> : null}
      {includeDirLight ? (
        <directionalLight name="dirLight" position={[1, 5, 1]} intensity={4.5} castShadow color={'white'} />
      ) : null}
      {includeFloorPlane ? (
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} name="floor" castShadow receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color={'white'} roughness={0.2} metalness={0} side={THREE.FrontSide} />
        </mesh>
      ) : null}
      {children}
    </Canvas>
  );
}

interface TestDefaultAppProps {
  children?: ReactNode;
  cameraType?: 'perspective' | 'orthographic';
  onSetupEffect?: SetUpProps['onSetupEffect'];
  onThreeChange?: SetUpProps['onThreeChange'];
  onCPanelReady?: CPanelProps['onCPanelReady'];
  onCPanelUnmounted?: CPanelProps['onCPanelUnmounted'];
}

export function TestDefaultApp(props: TestDefaultAppProps) {
  const {
    children,
    cameraType = 'perspective',
    onThreeChange,
    onSetupEffect,
    onCPanelReady,
    onCPanelUnmounted
  } = props;

  const { camera, scene, inspector } = useDefaultSetup({
    onSetupEffect,
    onThreeChange,
    onCPanelReady,
    onCPanelUnmounted,
    cameraType
  });

  useEffect(() => {
    return () => {
      // reset
      useAppStore.getState().setDestroyOnRemove(true);
      useAppStore.getState().setCameraControl('orbit');
      useAppStore.getState().setAttachDefaultControllersToPlayingCamera(true);
    };
  }, []);

  return (
    <Canvas camera={camera} scene={scene} shadows={'soft'} gl={glOptions} frameloop={'always'}>
      {inspector}
      {children}
    </Canvas>
  );
}

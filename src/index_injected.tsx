import * as THREE from 'three';
import { ReactNode, StrictMode, useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { OrbitControls as OrbitControlsImpl } from 'three/examples/jsm/controls/OrbitControls';
import { Experience } from 'scenarios/Experience';
import { Inspector } from 'lib/injectInspector';
import './index.css';

const params = {
  asset: 'two'
};
const assets = ['one', 'two', 'three'];

// TODO: Note, these custom params are merged with custom params from Experience scenario
const customParams = {
  asset: {
    object: params,
    prop: 'asset',
    control: {
      label: 'Asset',
      options: assets.reduce((acc, asset) => {
        acc[asset] = asset;
        return acc;
      }, {} as any),
      onChange: (value: string) => {
        console.log('onChange', value);
      }
    }
  }
};

interface AppProps {
  children?: ReactNode;
}

export function App(props: AppProps) {
  const { children } = props;
  const [orbitControls, setOrbitControls] = useState<OrbitControlsImpl | null | undefined>(null);

  const setOrbitControlsRef = useCallback((ctrl: any) => {
    setOrbitControls(ctrl);
  }, []);

  return (
    <Canvas
      camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 0, 15] }}
      scene={{ fog: new THREE.Fog(0xa0a0a0, 2, 100) }}
      shadows={'soft'}
      gl={{ antialias: true, precision: 'highp' }}
      frameloop={'always'}
    >
      <Inspector autoNavControls={true} orbitControls={orbitControls} customParams={customParams} />
      <OrbitControls makeDefault ref={setOrbitControlsRef} enableDamping={false} />
      {children}
    </Canvas>
  );
}

const useStrictMode = true;

createRoot(document.getElementById('main') as HTMLElement).render(
  useStrictMode ? (
    <StrictMode>
      <App>
        <Experience />
      </App>
    </StrictMode>
  ) : (
    <App>
      <Experience />
    </App>
  )
);

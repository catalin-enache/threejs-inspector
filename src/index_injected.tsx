import * as THREE from 'three';
import { ReactNode, StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
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

const glOptions = { antialias: true, precision: 'highp' };

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xa0a0a0, 2, 100);

const cameraPosition = new THREE.Vector3(0, 0, 12);
const camera1 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera1.position.copy(cameraPosition);

const camera2 = new THREE.OrthographicCamera(
  window.innerWidth / -2,
  window.innerWidth / 2,
  window.innerHeight / 2,
  window.innerHeight / -2,
  0.1,
  1000
);
camera2.position.copy(cameraPosition);
camera2.zoom = 45;
camera2.updateProjectionMatrix();

interface AppProps {
  children?: ReactNode;
}

export function App(props: AppProps) {
  const { children } = props;
  // @ts-ignore
  const [camera, setCamera] = useState<THREE.PerspectiveCamera | THREE.OrthographicCamera>(camera1);

  useEffect(() => {
    const intervalId = setInterval(() => {
      // setCamera((prevCamera) => {
      //   return prevCamera === camera1 ? camera2 : camera1;
      // });
    }, 4000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <Canvas
      camera={camera}
      scene={scene}
      shadows={'soft'}
      gl={(canvas) =>
        new THREE.WebGLRenderer({
          canvas,
          ...glOptions
        })
      }
      frameloop={'always'}
    >
      <Inspector autoNavControls={false} customParams={customParams} />
      {/*dampingFactor={0.05} is default*/}
      {/*<OrbitControls makeDefault={false} enableDamping={true} dampingFactor={0.1} />*/}
      <CameraControls makeDefault={true} />
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

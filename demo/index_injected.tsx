import * as THREE from 'three';
import { ReactNode, StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
// import { CameraControls as _CameraControls, OrbitControls as _OrbitControls } from '@react-three/drei';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Experience } from './scenarios/Experience';
import { Inspector } from 'src/lib/inspector';
import { extend } from '@react-three/fiber';
import { default as api, type AppStore } from 'src/lib/api';
import './main.css';

extend({ OrbitControls });

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

  const customCameraControls = false;
  const [camera, setCamera] = useState<THREE.PerspectiveCamera | THREE.OrthographicCamera>(camera1);
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);
  const [isDraggingTransformControls, setIsDraggingTransformControls] = useState(false);
  const initialPlayingState = api.getPlayingState();
  const [playingState, setPlayingState] = useState<AppStore['playingState']>(initialPlayingState);

  useEffect(() => {
    const keysListener = (event: KeyboardEvent) => {
      if (event.code === 'KeyC') {
        if (camera === camera1) {
          setCamera(camera2);
        } else {
          setCamera(camera1);
        }
      }
    };
    window.addEventListener('keydown', keysListener);
    return () => {
      window.removeEventListener('keydown', keysListener);
    };
  }, [camera]);

  return (
    <Canvas
      camera={camera}
      scene={scene}
      shadows={'soft'}
      gl={(defaultProps) => {
        const _renderer =
          renderer ??
          new THREE.WebGLRenderer({
            ...defaultProps,
            ...glOptions
          });
        !renderer && setRenderer(() => _renderer);
        return _renderer;
      }}
      frameloop={'always'}
    >
      <Inspector
        autoNavControls={customCameraControls ? 'never' : 'whenStopped'}
        customParams={customParams}
        showInspector={true}
        showGizmos={true}
        useTransformControls={true}
        onTransformControlsDragging={setIsDraggingTransformControls}
        onPlayingStateChange={setPlayingState}
      />
      {/*dampingFactor={0.05} is default*/}
      {/*<_OrbitControls makeDefault={true} enableDamping={true} dampingFactor={0.1} />*/}
      {/*CameraControls do not allow controlling camera from outside*/}
      {/*<_CameraControls makeDefault={true} />*/}
      {renderer && (
        <orbitControls
          args={[camera, renderer.domElement]}
          enabled={!isDraggingTransformControls && (customCameraControls || playingState !== 'stopped')}
          enableDamping={false}
        />
      )}
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

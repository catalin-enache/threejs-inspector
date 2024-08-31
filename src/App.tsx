import { ReactNode, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useInspector } from 'lib/hooks';
import * as THREE from 'three';

const glOptions = { antialias: true, precision: 'highp' };

const scene1 = new THREE.Scene();
scene1.fog = new THREE.Fog(0xa0a0a0, 2, 100);

const scene2 = new THREE.Scene();
scene2.fog = new THREE.Fog(0xff0000, 2, 100);

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
  const { camera: defaultCamera, scene: defaultScene, inspector } = useInspector();
  // @ts-ignore
  const [scene, setScene] = useState(scene1);
  // the scene that we set here is detected in useInspector hook, and it updates the scene that it returns;
  // related to TODO in SetUp => useAppStore.getState().triggerCurrentSceneChanged();
  // do we need this behaviour?
  // @ts-ignore
  const [camera, setCamera] = useState<THREE.PerspectiveCamera | THREE.OrthographicCamera>(camera1);

  // console.log(scene.uuid, defaultScene.uuid);

  useEffect(() => {
    const intervalId = setInterval(() => {
      // setScene((prevScene) => {
      //   // TODO: investigate the huge memory leak caused by this
      //   return prevScene === scene1 ? scene2 : scene1;
      // });
      // setCamera((prevCamera) => {
      //   return prevCamera === camera1 ? camera2 : camera1;
      // });
    }, 4000);
    return () => clearInterval(intervalId);
  }, []);

  /*
  shadow types
  const types = {
    basic: THREE.BasicShadowMap, // gives unfiltered shadow maps - fastest, but lowest quality.
    percentage: THREE.PCFShadowMap, // filters shadow maps using the Percentage-Closer Filtering (PCF) algorithm (default)
    soft/true: THREE.PCFSoftShadowMap, // filters shadow maps using the Percentage-Closer Filtering (PCF) algorithm with better soft shadows especially when using low-resolution shadow maps.
    variance: THREE.VSMShadowMap // filters shadow maps using the Variance Shadow Map (VSM) algorithm. When using VSMShadowMap all shadow receivers will also cast shadows
  };
  VSMShadowMap works with Light.shadow.blurSamples
  VSMShadowMap was showing shadow acne for PointLight which was solved with bias -0.0001
  PCFSoftShadowMap and BasicShadowMap do not work with Light.shadow.radius
  * */

  // R3F takes care of adding/removing the camera from the scene
  // and propagating it to useThree hook

  return (
    <Canvas
      key={scene.uuid}
      camera={camera}
      scene={scene}
      shadows="soft"
      gl={glOptions}
      frameloop="always" // 'always' | 'demand' | 'never'
      // legacy
      // when legacy is true it sets THREE.ColorManagement.enabled = false, by default THREE.ColorManagement is enabled
      // when THREE.ColorManagement is enabled, ThreeJS will automatically handle the conversion of textures and colors to linear space.
    >
      {inspector}
      {children}
    </Canvas>
  );
}

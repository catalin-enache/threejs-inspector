import * as THREE from 'three';
import { useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { useStats } from 'lib/hooks';
import { api } from 'src';

export const useDefaultExperienceSetup = ({
  cameraPosition,
  cameraRotation,
  cameraTarget,
  orthographicCameraZoom,
  useStats: _useStats = true,
  showGizmos = true,
  showAxesHelper = true,
  showGridHelper = false,
  registerDefaultPlayTriggers = false,
  playingState = 'stopped',
  ambientLight,
  directionalLight,
  spotLight,
  floor
}: {
  cameraPosition?: THREE.Vector3;
  cameraRotation?: THREE.Euler;
  cameraTarget?: THREE.Vector3;
  orthographicCameraZoom?: number;
  useStats?: boolean;
  showAxesHelper?: boolean;
  showGridHelper?: boolean;
  showGizmos?: boolean;
  registerDefaultPlayTriggers?: boolean;
  playingState?: Parameters<typeof api.setPlayingState>[0];
  ambientLight?: {
    color?: string;
    intensity?: number;
    position?: [number, number, number];
  };
  directionalLight?: {
    color?: string;
    intensity?: number;
    position?: [number, number, number];
  };
  spotLight?: {
    color?: string;
    intensity?: number;
    position?: [number, number, number];
    targetPosition?: [number, number, number];
    distance?: number;
    angle?: number;
    power?: number;
    decay?: number;
    penumbra?: number;
  };
  floor?: {
    size?: number;
    position?: [number, number, number];
    rotation?: [number, number, number];
  };
} = {}) => {
  const { scene, camera } = useThree();
  useStats({ enabled: _useStats });

  useEffect(() => {
    if (!registerDefaultPlayTriggers) return;
    return api.registerDefaultPlayTriggers();
  }, [registerDefaultPlayTriggers]);

  useEffect(() => {
    return api.setPlayingState(playingState);
  }, [playingState]);

  useEffect(() => {
    api.setShowGridHelper(showGridHelper);
    api.setShowAxesHelper(showAxesHelper);
    api.setShowGizmos(showGizmos);
  }, [showAxesHelper, showGizmos, showGridHelper]);

  const _ambientLight = useMemo(() => {
    if (!ambientLight) return null;
    const light = new THREE.AmbientLight(ambientLight.color || '#ffffff', ambientLight.intensity || 1);
    light.position.set(...(ambientLight.position || [0, 20, 0]));
    return light;
  }, [ambientLight]);

  const _directionalLight = useMemo(() => {
    if (!directionalLight) return null;
    // Create a directional light with default values if not provided
    const light = new THREE.DirectionalLight(directionalLight.color ?? '#ffffff', directionalLight.intensity ?? 4.5);
    light.position.set(...(directionalLight.position || [-20, 20, 20]));
    light.castShadow = true;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.radius = 4;
    light.shadow.camera.right = 15;
    light.shadow.camera.left = -15;
    light.shadow.camera.top = 15;
    light.shadow.camera.bottom = -15;
    light.shadow.blurSamples = 8;
    light.shadow.bias = -0.0014;
    return light;
    // return !directionalLight ? null : (
    //   <directionalLight
    //     color={directionalLight.color || '#ffffff'}
    //     intensity={directionalLight.intensity || 4.5}
    //     position={directionalLight.position || [-20, 20, 20]}
    //     shadow-mapSize-width={2048}
    //     shadow-mapSize-height={2048}
    //     shadow-radius={4}
    //     shadow-camera-right={15}
    //     shadow-camera-left={-15}
    //     shadow-camera-top={15}
    //     shadow-camera-bottom={-15}
    //     shadow-blurSamples={8}
    //     shadow-bias={-0.0014}
    //     castShadow
    //   />
    // );
  }, [directionalLight]);

  const _spotLight = useMemo(() => {
    if (!spotLight) return null;
    const light = new THREE.SpotLight(
      spotLight.color ?? '#ffffff',
      spotLight.intensity ?? 6,
      spotLight.distance ?? 70,
      spotLight.angle ?? Math.PI / 8,
      spotLight.penumbra ?? 0.5,
      spotLight.decay ?? 0.4
    );
    light.position.set(...(spotLight.position || [20, 20, 20]));
    light.target.position.set(...(spotLight.targetPosition || [0, 0, 0]));
    light.castShadow = true;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.radius = 4;
    light.shadow.blurSamples = 8;
    return light;
  }, [spotLight]);

  const _floor = useMemo(() => {
    if (!floor) return null;
    const geometry = new THREE.PlaneGeometry(floor.size || 100, floor.size || 100);
    const material = new THREE.MeshStandardMaterial({ color: '#ffffff', side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...(floor.position || [0, -5, 0]));
    mesh.rotation.set(...(floor.rotation || [-Math.PI / 2, 0, 0]));
    mesh.receiveShadow = true; // Enable shadow receiving
    mesh.__inspectorData.isInspectable = true;
    return mesh;
  }, [floor]);

  useEffect(() => {
    // because R3F adds geometry asynchronously, after internal setup
    api.updateSceneBBox();
    // Set up the scene
    scene.background = new THREE.Color().setHex(0x000000);
    return () => {
      scene.background = null;
    };
  }, [scene]);

  useEffect(() => {
    camera.position.copy(cameraPosition ?? new THREE.Vector3(0, 0, 22));
    camera.rotation.copy(cameraRotation ?? new THREE.Euler(0, 0, 0));
    camera.lookAt(cameraTarget ?? new THREE.Vector3(0, 0, 0));
    camera.updateProjectionMatrix();

    if (camera instanceof THREE.OrthographicCamera) {
      camera.zoom = orthographicCameraZoom ?? 30;
    }
  }, [camera, cameraPosition, cameraRotation, orthographicCameraZoom, cameraTarget]);

  return {
    ambientLight: _ambientLight,
    directionalLight: _directionalLight,
    spotLight: _spotLight,
    floor: _floor
  };
};

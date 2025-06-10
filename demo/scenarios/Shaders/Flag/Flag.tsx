import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
// @ts-ignore
import { CustomControl } from 'src/components/CustomControl/CustomControl';
import { usePlay } from 'src/lib/hooks';
import { useStats } from 'lib/hooks';
import { api } from 'src';

import vertexShader from './glsl/vertex.glsl';
import fragmentShader from './glsl/fragment.glsl';

const planeGeometry = new THREE.PlaneGeometry(10, 10, 64, 64);

const addRandoms = (geometry: THREE.BufferGeometry) => {
  const count = geometry.attributes.position.count;
  const randoms = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    randoms[i] = Math.random();
  }
  geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));
};

addRandoms(planeGeometry);

const flagTexture = (await api.createTexturesFromImages('textures/pbr/floors/FloorsCheckerboard_S_Diffuse.jpg'))[0];
// const flagTexture = new THREE.TextureLoader().load('textures/pbr/floors/FloorsCheckerboard_S_Diffuse.jpg');
const material = new THREE.RawShaderMaterial({
  vertexShader,
  fragmentShader,
  wireframe: false,
  side: THREE.DoubleSide,
  transparent: false,
  uniforms: {
    uIntensity: { value: 0.5 },
    uFrequency: { value: new THREE.Vector2(0.5, 0.5) },
    uTime: { value: 0 },
    uTexture: { value: flagTexture }
  }
});

export function Flag() {
  const { scene, camera } = useThree();
  useStats();

  const paramsRef = useRef({
    tessellation: planeGeometry.parameters.heightSegments
  });

  useEffect(() => {
    return api.registerDefaultPlayTriggers();
  }, []);

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
    camera.position.set(0, 0, 22);
    camera.rotation.set(0, 0, 0);
    if (camera instanceof THREE.OrthographicCamera) {
      camera.zoom = 30;
    }
  }, [camera]);

  // const customPropsRef = useRef({});

  usePlay((_playingState, _rootState, _delta) => {
    const elapsedTime = _rootState.clock.elapsedTime;
    material.uniforms.uTime.value = elapsedTime;
  });

  return (
    <>
      <mesh
        position={[0, 0, 0]}
        name="mesh"
        __inspectorData={{ isInspectable: true }}
        geometry={planeGeometry}
        material={material}
      />
      <CustomControl
        name={'tessellation'}
        object={paramsRef.current}
        prop={'tessellation'}
        control={{
          label: 'Tessellation',
          min: 1,
          max: 256,
          step: 1,
          onChange: (value) => {
            planeGeometry.dispose();
            const newGeometry = new THREE.PlaneGeometry(10, 10, value, value);
            planeGeometry.copy(newGeometry);
            addRandoms(planeGeometry);
          }
        }}
      />
      <CustomControl
        name={'uIntensity'}
        object={material.uniforms.uIntensity}
        prop={'value'}
        control={{
          label: 'Intensity',
          min: 0,
          max: 1,
          step: 0.1
          // onChange: () => {}
        }}
      />
      <CustomControl
        name={'uFrequency'}
        object={material.uniforms.uFrequency}
        prop={'value'}
        control={{
          label: 'Frequency',
          x: { min: 0, max: 2, step: 0.1 },
          y: { min: 0, max: 2, step: 0.1 }
          // onChange: () => {}
        }}
      />
    </>
  );
}

export default Flag;

import * as THREE from 'three';
import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
// @ts-ignore
import { CustomControl } from 'src/components/CustomControl/CustomControl';
import { usePlay } from 'src/lib/hooks';
import { useStats } from 'lib/hooks';
import { api } from 'src';

import vertexShader from './glsl/vertex.glsl';
import fragmentShader from './glsl/fragment.glsl';

const heightMap = (
  await api.createTexturesFromImages('textures/pbr/castle_brick_02/castle_brick_02_red_4k_disp.jpg')
)[0];

const planeGeometry = new THREE.PlaneGeometry(10, 10, 1, 1);

const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  wireframe: false,
  side: THREE.DoubleSide,
  transparent: false,
  uniforms: {
    uHeightMap: { value: heightMap },
    uIntensity: { value: 2 },
    uOffset: { value: 0.3 }
  }
});

export function HeightMapToNormalMap() {
  const { scene, camera, gl } = useThree();
  useStats();

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
    camera.position.set(0, 0, 9);
    camera.rotation.set(0, 0, 0);
    if (camera instanceof THREE.OrthographicCamera) {
      camera.zoom = 65;
    }
  }, [camera]);

  usePlay((_playingState, _rootState, _delta) => {});

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
        name={'uIntensity'}
        object={material.uniforms.uIntensity}
        prop={'value'}
        control={{
          label: 'Intensity',
          min: 0,
          max: 10,
          step: 0.1
          // onChange: () => {}
        }}
      />
      <CustomControl
        name={'uOffset'}
        object={material.uniforms.uOffset}
        prop={'value'}
        control={{
          label: 'Offset',
          min: -1,
          max: 1,
          step: 0.01
          // onChange: () => {}
        }}
      />
      <CustomControl
        name={'uHeightMap'}
        object={material.uniforms.uHeightMap}
        prop={'value'}
        control={{
          label: 'Height Map',
          gl,
          color: { type: 'float' },
          onChange: (...args: any[]) => {
            console.log('Experience reacting to SceneBG value change', args);
          }
        }}
      />
    </>
  );
}

export default HeightMapToNormalMap;

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

const planeGeometry = new THREE.PlaneGeometry(10, 10, 1, 1);

const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  wireframe: false,
  side: THREE.DoubleSide,
  transparent: false,
  uniforms: {
    uPattern: { value: 1 },
    uVars: { value: new THREE.Vector4(0, 0, 0, 0) },
    uResolution: {
      value: new THREE.Vector2(window.innerWidth, window.innerHeight)
    }
  }
});

window.addEventListener('resize', () => {
  material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
});

export function PatternsUV() {
  const { scene, camera } = useThree();
  useStats();

  // const paramsRef = useRef({});

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
        name={'pattern'}
        object={material.uniforms.uPattern}
        prop={'value'}
        control={{
          label: 'Pattern',
          min: 1,
          max: 40,
          step: 1
        }}
      />
      <CustomControl
        name={'vars'}
        object={material.uniforms.uVars}
        prop={'value'}
        control={{
          label: 'Vars',
          x: { min: 0, max: 1, step: 0.01, pointerScale: 0.01 },
          y: { min: 0, max: 1, step: 0.01, pointerScale: 0.01 },
          z: { min: 0, max: 1, step: 0.01, pointerScale: 0.01 },
          w: { min: 0, max: 1, step: 0.01, pointerScale: 0.01 }
        }}
      />
    </>
  );
}

export default PatternsUV;

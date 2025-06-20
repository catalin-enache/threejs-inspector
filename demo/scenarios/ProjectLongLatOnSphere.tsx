import * as THREE from 'three';
import { useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
// @ts-ignore
import { CustomControl } from 'src/components/CustomControl/CustomControl';
// import { usePlay } from 'src/lib/hooks';
import { projectLongLatOnSphere } from 'src/lib/utils/math/projectLongLatOnSphere';
import { useStats } from 'lib/hooks';
import { api } from 'src';

const radius = 10;
const initialDirection = { x: 0, y: 1.6 };

export function ProjectLongLatOnSphere() {
  const [direction, setDirection] = useState(projectLongLatOnSphere({ ...initialDirection, r: radius }));
  const { scene, camera } = useThree();
  useStats();

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

  const customPropsRef = useRef({
    direction: initialDirection
  });

  // usePlay((_state, _delta) => {});

  return (
    <>
      <group name="lights group">
        <ambientLight color={'#ffffff'} intensity={3.5} position={[0, 1, 0]} />
      </group>

      <mesh name="sphere">
        <sphereGeometry args={[10, 32, 32]} />
        <meshStandardMaterial color={'#ffffff'} wireframe />
      </mesh>

      <mesh position={direction} name="projection" __inspectorData={{ isInspectable: true }}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color={'#ff0000'} />
      </mesh>

      <CustomControl
        name={'direction'}
        object={customPropsRef.current}
        prop={'direction'}
        control={{
          label: 'Direction',
          x: { min: 0, max: 2 * Math.PI },
          y: { min: 0, max: Math.PI },
          onChange: ({ x: longitude, y: latitude }: { x: number; y: number }) => {
            const newDirection: [number, number, number] = projectLongLatOnSphere({
              x: longitude,
              y: latitude,
              r: radius
            });
            setDirection(newDirection);
          }
        }}
      />
    </>
  );
}

export default ProjectLongLatOnSphere;

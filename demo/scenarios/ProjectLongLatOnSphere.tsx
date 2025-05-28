import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
// @ts-ignore
import Stats from 'three/addons/libs/stats.module.js';
import { CustomControl } from 'src/components/CustomControl/CustomControl';
import { usePlay } from 'src/lib/hooks';
import { projectLongLatOnSphere } from 'src/lib/utils/projectLongLatOnSphere';
import { useAppStore } from 'src/store';
import patchThree from 'src/lib/patchThree';

const stats = new Stats();
document.body.appendChild(stats.dom);

const radius = 10;
const initialDirection = { x: 0, y: 1.6 };

export function ProjectLongLatOnSphere() {
  const [direction, setDirection] = useState(projectLongLatOnSphere({ ...initialDirection, r: radius }));

  const customPropsRef = useRef({
    direction: initialDirection
  });

  useFrame((_state, _delta) => {
    stats.update();
  });

  usePlay((_state, _delta) => {});

  useEffect(() => {
    useAppStore.getState().setCameraType('orthographic');
    const currentCamera = patchThree.getCurrentCamera();
    currentCamera.position.set(-12, 0, 0);
    currentCamera.rotation.set(0, -90, 0);
    currentCamera.zoom = 31;
  }, []);

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

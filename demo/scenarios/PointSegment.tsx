import * as THREE from 'three';
import { Line } from '@react-three/drei';
// @ts-ignore
import { CustomControl } from 'src/components/CustomControl/CustomControl';
import { usePlay } from 'lib/hooks';

import { useDefaultExperienceSetup } from './hooks/useDefaultExperienceSetup';
import { useRef, useState } from 'react';
import { getClosestPointOnSegment } from 'lib/utils/math/pointSegment';

const experienceSetup: Parameters<typeof useDefaultExperienceSetup>[0] = {
  cameraPosition: new THREE.Vector3(0, 20, 0),
  ambientLight: {},
  directionalLight: {},
  spotLight: {},
  floor: {},
  registerDefaultPlayTriggers: true,
  playingState: 'playing'
};

export function PointSegment() {
  const { ambientLight, directionalLight } = useDefaultExperienceSetup(experienceSetup);

  const [c01Position, setC01Position] = useState<[number, number, number]>([-5, 0, 0]);
  const [c02Position, setC02Position] = useState<[number, number, number]>([5, 0, 0]);
  const [pPosition, setPPosition] = useState<[number, number, number]>([0, 0, 5]);
  const [closestPointClampedPosition, setClosestPointClampedPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [closestPointPosition, setClosestPointPosition] = useState<[number, number, number]>([0, 0, 0]);

  const c01Ref = useRef<THREE.Mesh | null>(null);
  const c02Ref = useRef<THREE.Mesh | null>(null);
  const pRef = useRef<THREE.Mesh | null>(null);

  usePlay((_playingState, _rootState, _delta) => {
    if (!c01Ref.current || !c02Ref.current || !pRef.current) return;

    const [p, a, b] = [pRef.current.position, c01Ref.current.position, c02Ref.current.position];
    const closestPoint = getClosestPointOnSegment(p, a, b, { clamped: false });
    const closestPointClamped = getClosestPointOnSegment(p, a, b, { clamped: true });

    setClosestPointPosition([closestPoint.x, closestPoint.y, closestPoint.z]);
    setClosestPointClampedPosition([closestPointClamped.x, closestPointClamped.y, closestPointClamped.z]);
    // setPPosition([p.x, p.y, p.z]);
    setC01Position([a.x, a.y, a.z]);
    setC02Position([b.x, b.y, b.z]);

    const elapsedTime = _rootState.clock.elapsedTime;
    setPPosition([Math.sin(elapsedTime) * 10, p.y, p.z]);
  });

  return (
    <>
      {ambientLight && <primitive object={ambientLight} />}
      {directionalLight && <primitive object={directionalLight} />}
      {/*{spotLight && <primitive object={spotLight} />}*/}
      {/*{floor && <primitive object={floor} />}*/}
      <mesh name="c01" position={c01Position} ref={c01Ref} __inspectorData={{ isInspectable: true }} castShadow>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color={'#ff0000'} wireframe={false} />
      </mesh>
      <mesh name="c02" position={c02Position} ref={c02Ref} __inspectorData={{ isInspectable: true }} castShadow>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color={'#00ff00'} wireframe={false} />
      </mesh>
      <mesh name="p" position={pPosition} ref={pRef} __inspectorData={{ isInspectable: true }} castShadow>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color={'#0000ff'} wireframe={false} />
      </mesh>
      <mesh
        name="closestPointClamped"
        position={closestPointClampedPosition}
        __inspectorData={{ isInspectable: true }}
        castShadow
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color={'#ffffff'} wireframe={false} />
      </mesh>
      <mesh name="closestPoint" position={closestPointPosition} __inspectorData={{ isInspectable: true }} castShadow>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color={'#eeeeee'} wireframe={true} />
      </mesh>
      <Line points={[c01Position, c02Position]} />
      <Line points={[pPosition, closestPointClampedPosition]} />
      <Line points={[pPosition, closestPointPosition]} />
    </>
  );
}

export default PointSegment;

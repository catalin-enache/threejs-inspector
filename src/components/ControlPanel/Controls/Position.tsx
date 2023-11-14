/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-ignore
import { InputFloat } from 'src/components/InputFloat';
import * as THREE from 'three';

interface PositionProps {
  selectedObject: THREE.Object3D<THREE.Object3DEventMap>;
  changePosition: (coordinate: 'x' | 'y' | 'z') => (value: number) => void;
}
export const Position = ({ selectedObject, changePosition }: PositionProps) => {
  return (
    <>
      <div className="controlRow">
        <div className="rowTitle">Position</div>
        <InputFloat
          className="rowEntry"
          label="X"
          value={selectedObject.position.x}
          onChange={changePosition('x')}
        />
        <InputFloat
          className="rowEntry"
          label="Y"
          value={selectedObject.position.y}
          onChange={changePosition('y')}
        />
        <InputFloat
          className="rowEntry"
          label="Z"
          value={selectedObject.position.z}
          onChange={changePosition('z')}
        />
      </div>
    </>
  );
};

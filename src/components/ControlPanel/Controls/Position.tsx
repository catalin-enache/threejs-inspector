// @ts-ignore
import { InputNumber } from 'src/components/InputNumber';
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
        <InputNumber
          className="rowEntry"
          label="X"
          value={selectedObject.position.x}
          onChange={changePosition('x')}
        />
        <InputNumber
          className="rowEntry"
          label="Y"
          value={selectedObject.position.y}
          onChange={changePosition('y')}
        />
        <InputNumber
          className="rowEntry"
          label="Z"
          value={selectedObject.position.z}
          onChange={changePosition('z')}
        />
      </div>
    </>
  );
};

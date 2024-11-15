// @ts-ignore
import { InputNumber } from 'old_src/components/InputNumber';
import * as THREE from 'three';

interface RotationProps {
  selectedObject: THREE.Object3D<THREE.Object3DEventMap>;
  changeScale: (coordinate: 'x' | 'y' | 'z') => (value: number) => void;
}
export const Scale = ({ selectedObject, changeScale }: RotationProps) => {
  return (
    <>
      <div className="controlRow">
        <div className="rowTitle">Scale</div>
        <InputNumber
          className="rowEntry"
          label="X"
          value={selectedObject.scale.x}
          onChange={changeScale('x')}
        />
        <InputNumber
          className="rowEntry"
          label="Y"
          value={selectedObject.scale.y}
          onChange={changeScale('y')}
        />
        <InputNumber
          className="rowEntry"
          label="Z"
          value={selectedObject.scale.z}
          onChange={changeScale('z')}
        />
      </div>
    </>
  );
};

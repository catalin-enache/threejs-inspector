// @ts-ignore
import { InputNumber } from 'old_src/components/InputNumber';
import * as THREE from 'three';

interface RotationProps {
  selectedObject: THREE.Object3D<THREE.Object3DEventMap>;
  changeRotation: (coordinate: 'x' | 'y' | 'z') => (value: number) => void;
}
export const Rotation = ({ selectedObject, changeRotation }: RotationProps) => {
  return (
    <>
      <div className="controlRow">
        <div className="rowTitle">Rotation</div>
        <InputNumber
          className="rowEntry"
          label="X"
          value={THREE.MathUtils.radToDeg(selectedObject.rotation.x)}
          onChange={changeRotation('x')}
        />
        <InputNumber
          className="rowEntry"
          label="Y"
          value={THREE.MathUtils.radToDeg(selectedObject.rotation.y)}
          onChange={changeRotation('y')}
        />
        <InputNumber
          className="rowEntry"
          label="Z"
          value={THREE.MathUtils.radToDeg(selectedObject.rotation.z)}
          onChange={changeRotation('z')}
        />
      </div>
    </>
  );
};

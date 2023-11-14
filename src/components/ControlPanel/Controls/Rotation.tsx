/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-ignore
import { InputFloat } from 'src/components/InputFloat';
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
        <InputFloat
          className="rowEntry"
          label="X"
          value={THREE.MathUtils.radToDeg(selectedObject.rotation.x)}
          onChange={changeRotation('x')}
        />
        <InputFloat
          className="rowEntry"
          label="Y"
          value={THREE.MathUtils.radToDeg(selectedObject.rotation.y)}
          onChange={changeRotation('y')}
        />
        <InputFloat
          className="rowEntry"
          label="Z"
          value={THREE.MathUtils.radToDeg(selectedObject.rotation.z)}
          onChange={changeRotation('z')}
        />
      </div>
    </>
  );
};

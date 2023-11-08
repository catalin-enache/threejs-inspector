/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-ignore
import { InputNumber } from '../../InputNumber';
import * as THREE from 'three';

interface InfoProps {
  selectedObject: THREE.Object3D<THREE.Object3DEventMap>;
}
export const Info = ({ selectedObject }: InfoProps) => {
  return (
    <>
      <div className="controlRow">
        <div className="rowEntry">Control {selectedObject.name}</div>
      </div>
      <div className="controlRow">
        <div className="rowEntry">{selectedObject.uuid}</div>
      </div>
    </>
  );
};

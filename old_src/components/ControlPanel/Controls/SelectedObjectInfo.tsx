// @ts-ignore
import { InputNumber } from 'old_src/components/InputNumber';
import * as THREE from 'three';

interface SelectedObjectInfoProps {
  selectedObject: THREE.Object3D<THREE.Object3DEventMap>;
}
export const SelectedObjectInfo = ({
  selectedObject
}: SelectedObjectInfoProps) => {
  return (
    <>
      <div className="controlRow" title="F (focus)">
        <div className="rowEntry">Control {selectedObject.name}</div>
      </div>
      <div className="controlRow" title="F (focus)">
        <div className="rowEntry">{selectedObject.uuid}</div>
      </div>
    </>
  );
};

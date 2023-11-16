// @ts-ignore
import { InputNumber } from 'src/components/InputNumber';
// import * as THREE from 'three';

interface TransformControlsSpaceProps {
  transformControls: any;
  toggleTransformSpace: () => void;
}
export const TransformControlsSpace = ({
  transformControls,
  toggleTransformSpace
}: TransformControlsSpaceProps) => {
  return (
    <>
      <div
        className="controlRow"
        style={{ cursor: 'pointer' }}
        onClick={toggleTransformSpace}
      >
        <div className="rowEntry">
          Controls space: {transformControls.space}
        </div>
      </div>
    </>
  );
};

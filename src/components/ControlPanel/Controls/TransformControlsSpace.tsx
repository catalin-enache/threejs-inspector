/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-ignore
import { InputNumber } from 'components/InputNumber';
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

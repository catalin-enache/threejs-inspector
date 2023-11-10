/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-ignore
import { InputNumber } from 'components/InputNumber';
// import * as THREE from 'three';

interface TransformControlsProps {
  transformControls: any;
  setTransformMode: (mode: 'translate' | 'rotate' | 'scale') => () => void;
}
export const TransformControls = ({
  transformControls,
  setTransformMode
}: TransformControlsProps) => {
  return (
    <>
      <div className="controlRow">
        <div className="rowTitle">Controls</div>
        <div
          className={`rowEntry controlTab ${
            transformControls.mode === 'translate' ? 'active' : ''
          }`}
          onClick={setTransformMode('translate')}
        >
          Translate
        </div>
        <div
          className={`rowEntry controlTab ${
            transformControls.mode === 'rotate' ? 'active' : ''
          }`}
          onClick={setTransformMode('rotate')}
        >
          Rotate
        </div>
        <div
          className={`rowEntry controlTab ${
            transformControls.mode === 'scale' ? 'active' : ''
          }`}
          onClick={setTransformMode('scale')}
        >
          Scale
        </div>
      </div>
    </>
  );
};

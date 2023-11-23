// @ts-ignore
import { InputNumber } from 'src/components/InputNumber';
import { useEffect } from 'react';
// import * as THREE from 'three';

interface TransformControlsSpaceProps {
  transformControls: any;
  toggleTransformSpace: () => void;
}
export const TransformControlsSpace = ({
  transformControls,
  toggleTransformSpace
}: TransformControlsSpaceProps) => {
  useEffect(() => {
    const handleKeyDown = (_evt: KeyboardEvent) => {
      _evt.code === 'KeyL' && toggleTransformSpace();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggleTransformSpace]);
  return (
    <>
      <div
        className="controlRow"
        style={{ cursor: 'pointer' }}
        onClick={toggleTransformSpace}
        title="L"
      >
        <div className="rowEntry">
          Controls space: {transformControls.space}
        </div>
      </div>
    </>
  );
};

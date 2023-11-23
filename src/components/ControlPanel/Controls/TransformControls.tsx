// @ts-ignore
import { InputNumber } from 'src/components/InputNumber';
import { useEffect } from 'react';
// import * as THREE from 'three';

interface TransformControlsProps {
  transformControls: any;
  setTransformMode: (mode: 'translate' | 'rotate' | 'scale') => () => void;
}
export const TransformControls = ({
  transformControls,
  setTransformMode
}: TransformControlsProps) => {
  useEffect(() => {
    const handleKeyDown = (_evt: KeyboardEvent) => {
      _evt.code === 'Comma' && setTransformMode('translate')();
      _evt.code === 'Period' && setTransformMode('rotate')();
      _evt.code === 'Slash' && setTransformMode('scale')();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setTransformMode]);
  return (
    <>
      <div className="controlRow">
        <div className="rowTitle">Controls</div>
        <div
          className={`rowEntry controlTab ${
            transformControls.mode === 'translate' ? 'active' : ''
          }`}
          onClick={setTransformMode('translate')}
          title="Comma"
        >
          Translate
        </div>
        <div
          className={`rowEntry controlTab ${
            transformControls.mode === 'rotate' ? 'active' : ''
          }`}
          onClick={setTransformMode('rotate')}
          title="Period"
        >
          Rotate
        </div>
        <div
          className={`rowEntry controlTab ${
            transformControls.mode === 'scale' ? 'active' : ''
          }`}
          onClick={setTransformMode('scale')}
          title="Slash"
        >
          Scale
        </div>
      </div>
    </>
  );
};

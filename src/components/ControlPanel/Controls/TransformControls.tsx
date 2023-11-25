// @ts-ignore
import { InputNumber } from 'src/components/InputNumber';
import { SceneObjects } from 'src/scene.ts';
import { useCallback } from 'react';
// import * as THREE from 'three';

interface TransformControlsProps {
  scene: SceneObjects;
}
export const TransformControls = ({ scene }: TransformControlsProps) => {
  const mode = scene.getTransformControls().mode;
  const setTransformControlsMode = useCallback(
    (_mode: string) => () => {
      scene.setTransformControlsMode(_mode);
    },
    []
  );
  return (
    <>
      <div className="controlRow">
        <div className="rowTitle">Controls</div>
        <div
          className={`rowEntry controlTab ${
            mode === 'translate' ? 'active' : ''
          }`}
          onClick={setTransformControlsMode('translate')}
          title="Comma"
        >
          Translate
        </div>
        <div
          className={`rowEntry controlTab ${mode === 'rotate' ? 'active' : ''}`}
          onClick={setTransformControlsMode('rotate')}
          title="Period"
        >
          Rotate
        </div>
        <div
          className={`rowEntry controlTab ${mode === 'scale' ? 'active' : ''}`}
          onClick={setTransformControlsMode('scale')}
          title="Slash"
        >
          Scale
        </div>
      </div>
    </>
  );
};

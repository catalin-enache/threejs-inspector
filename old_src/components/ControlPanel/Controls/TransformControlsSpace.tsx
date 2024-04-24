// @ts-ignore
import { InputNumber } from 'old_src/components/InputNumber';
import { SceneObjects } from 'old_src/scene';
import { useCallback } from 'react';
// import * as THREE from 'three';

interface TransformControlsSpaceProps {
  scene: SceneObjects;
}
export const TransformControlsSpace = ({
  scene
}: TransformControlsSpaceProps) => {
  const transformControls = scene.getTransformControls();
  const orbitControls = scene.getOrbitControls();
  // const focusCamera = scene.focusCamera;
  const focusCamera = useCallback(() => {
    scene.focusCamera({ transformControls, orbitControls });
  }, []);
  return (
    <>
      <div className="controlRow">
        <div
          className="rowEntry"
          style={{ cursor: 'pointer' }}
          onClick={scene.toggleTransformControlsSpace}
          title="L"
        >
          Space: {scene.getTransformControls().space}
        </div>
        <div
          className="rowEntry"
          onClick={focusCamera}
          title="F"
          style={{ cursor: 'pointer' }}
        >
          Focus
        </div>
      </div>
    </>
  );
};

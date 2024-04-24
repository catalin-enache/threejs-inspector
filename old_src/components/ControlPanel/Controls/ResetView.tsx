import { SceneObjects } from 'old_src/scene';
import { useCallback } from 'react';
import { resetCamera } from 'old_src/sceneModules/resetCamera';

interface ResetViewProps {
  scene: SceneObjects;
}
export const ResetView = ({ scene }: ResetViewProps) => {
  const camera = scene.getCamera();

  const isFrontView =
    +camera.position.x.toFixed(1) === 0 &&
    +camera.position.y.toFixed(1) === 0 &&
    +camera.position.z.toFixed(1) > 0;
  const isTopView =
    +camera.position.x.toFixed(1) === 0 &&
    +camera.position.z.toFixed(1) === 0 &&
    +camera.position.y.toFixed(1) > 0;
  const isRightView =
    +camera.position.y.toFixed(1) === 0 &&
    +camera.position.z.toFixed(1) === 0 &&
    +camera.position.x.toFixed(1) > 0;
  const isBackView =
    +camera.position.x.toFixed(1) === 0 &&
    +camera.position.y.toFixed(1) === 0 &&
    +camera.position.z.toFixed(1) < 0;
  const isBottomView =
    +camera.position.x.toFixed(1) === 0 &&
    +camera.position.z.toFixed(1) === 0 &&
    +camera.position.y.toFixed(1) < 0;
  const isLeftView =
    +camera.position.y.toFixed(1) === 0 &&
    +camera.position.z.toFixed(1) === 0 &&
    +camera.position.x.toFixed(1) < 0;

  const handleResetCamera = useCallback(
    (code: string) => () => {
      code.split('|').forEach((key) => {
        resetCamera({
          camera: scene.getCamera(),
          orbitControls: scene.getOrbitControls(),
          code: key
        });
      });
    },
    []
  );

  return (
    <>
      <div className="controlRow">
        <div
          className={`rowEntry controlTab ${isFrontView ? 'active' : ''}`}
          onClick={handleResetCamera('Numpad1')}
        >
          <span title="Num 1">Front</span>
        </div>
        <div
          className={`rowEntry controlTab ${isBackView ? 'active' : ''}`}
          onClick={handleResetCamera('Numpad1|Numpad9')}
        >
          <span title="Num 1 Num 9">Back</span>
        </div>
        <div
          className={`rowEntry controlTab ${isTopView ? 'active' : ''}`}
          onClick={handleResetCamera('Numpad7')}
        >
          <span title="Num 7">Top</span>
        </div>
        <div
          className={`rowEntry controlTab ${isBottomView ? 'active' : ''}`}
          onClick={handleResetCamera('Numpad7|Numpad9')}
        >
          <span title="Num 7 Num 9">Bott</span>
        </div>
        <div
          className={`rowEntry controlTab ${isRightView ? 'active' : ''}`}
          onClick={handleResetCamera('Numpad3')}
        >
          <span title="Num 3">Right</span>
        </div>
        <div
          className={`rowEntry controlTab ${isLeftView ? 'active' : ''}`}
          onClick={handleResetCamera('Numpad3|Numpad9')}
        >
          <span title="Num 3 Num 9">Left</span>
        </div>
      </div>
    </>
  );
};

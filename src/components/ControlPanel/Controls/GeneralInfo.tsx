import * as THREE from 'three';
import type { SceneObjects } from 'src/scene';
import { useCallback } from 'react';
import { useToggleCameraType } from 'components/ControlPanel/Hooks/useToggleCameraType';

interface GeneralInfoProps {
  scene: SceneObjects;
  forceUpdate: () => void;
}
export const GeneralInfo = ({ scene, forceUpdate }: GeneralInfoProps) => {
  const camera = scene.getCamera();
  const isOrbitCamera = scene.getOrbitControlsAreEnabled();
  const isFPSCamera = !isOrbitCamera;
  const navType = isFPSCamera ? 'FPS' : 'Orbit';
  const cameraType = scene.getConfig().cameraType;

  const toggleNavigationType = useCallback(() => {
    scene.toggleOrbitControls();
    forceUpdate();
  }, []);
  const toggleCameraType = useToggleCameraType({ forceUpdate });
  return (
    <>
      <div className="controlRow">
        <div className="rowTitle">Camera</div>
        <div
          className="rowEntry"
          style={{ cursor: 'pointer' }}
          onClick={toggleCameraType}
        >
          <span title="Toggle with key Num 5">{cameraType}</span>
        </div>
        <div
          className="rowEntry"
          style={{ cursor: 'pointer' }}
          onClick={toggleNavigationType}
        >
          <span title="Toggle with key o">{navType}</span>
        </div>
      </div>
      <div className="controlRow">
        <div className="rowEntry">
          <pre>
            {`xr: ${THREE.MathUtils.radToDeg(camera.rotation.x).toFixed(
              2
            )}`.padEnd(12, ' ')}
          </pre>
          <pre>
            {`yr: ${THREE.MathUtils.radToDeg(camera.rotation.y).toFixed(
              2
            )}`.padEnd(12, ' ')}
          </pre>
          <pre>
            {`zr: ${THREE.MathUtils.radToDeg(camera.rotation.z).toFixed(
              2
            )}`.padEnd(12, ' ')}
          </pre>
        </div>
      </div>
      <div className="controlRow">
        <div className="rowEntry">
          <pre>
            {`dist: ${camera.position.length().toFixed(2)}`.padEnd(16, ' ')}
          </pre>
          <pre>{`zoom: ${camera.zoom.toFixed(2)}`.padEnd(16, ' ')}</pre>
        </div>
      </div>
    </>
  );
};

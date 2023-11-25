import * as THREE from 'three';
import type { SceneObjects } from 'src/scene';
import { useCallback, useState } from 'react';
import { useToggleCameraType } from 'components/ControlPanel/Hooks/useToggleCameraType';
import { useKey } from 'components/ControlPanel/Hooks/useKey';
import { ResetView } from 'components/ControlPanel/Controls/ResetView';

interface GeneralInfoProps {
  scene: SceneObjects;
}
export const GeneralInfo = ({ scene }: GeneralInfoProps) => {
  const [showCameraDetails, setShowCameraDetails] = useState(false);
  const camera = scene.getCamera();
  const isOrbitCamera = scene.getOrbitControlsAreEnabled();
  const isFPSCamera = !isOrbitCamera;
  const navType = isFPSCamera ? 'FPS' : 'Orbit';
  const cameraType = scene.getConfig().cameraType;
  const cameraTypeLabel =
    cameraType === 'perspective' ? 'Perspective' : 'Orthographic';

  const toggleNavigationType = useCallback(() => {
    scene.toggleOrbitControls();
  }, []);
  const toggleCameraType = useToggleCameraType();
  const toggleShowCameraDetails = useCallback(() => {
    setShowCameraDetails((state) => !state);
  }, []);

  useKey({ keyCode: 'KeyC', keyDownCallback: toggleShowCameraDetails });

  return (
    <>
      <ResetView scene={scene} />
      <div className="controlRow">
        <div
          className="rowTitle"
          style={{ cursor: 'pointer' }}
          title="C"
          onClick={toggleShowCameraDetails}
        >
          Camera
        </div>
        <div
          className="rowEntry"
          style={{ cursor: 'pointer' }}
          onClick={toggleCameraType}
        >
          <span title="Num 5">{cameraTypeLabel}</span>
        </div>
        <div
          className="rowEntry"
          style={{ cursor: 'pointer' }}
          onClick={toggleNavigationType}
        >
          <span title="O">{navType}</span>
        </div>
      </div>
      {showCameraDetails && (
        <div className="controlRow">
          <div className="rowEntry">
            <pre>{`px: ${camera.position.x.toFixed(2)}`.padEnd(12, ' ')}</pre>
            <pre>{`py: ${camera.position.y.toFixed(2)}`.padEnd(12, ' ')}</pre>
            <pre>{`pz: ${camera.position.z.toFixed(2)}`.padEnd(12, ' ')}</pre>
          </div>
        </div>
      )}
      {showCameraDetails && (
        <div className="controlRow">
          <div className="rowEntry">
            <pre>
              {`rx: ${THREE.MathUtils.radToDeg(camera.rotation.x).toFixed(
                2
              )}`.padEnd(12, ' ')}
            </pre>
            <pre>
              {`ry: ${THREE.MathUtils.radToDeg(camera.rotation.y).toFixed(
                2
              )}`.padEnd(12, ' ')}
            </pre>
            <pre>
              {`rz: ${THREE.MathUtils.radToDeg(camera.rotation.z).toFixed(
                2
              )}`.padEnd(12, ' ')}
            </pre>
          </div>
        </div>
      )}
      {showCameraDetails && (
        <div className="controlRow">
          <div className="rowEntry">
            <pre>
              {`dist: ${camera.position.length().toFixed(2)}`.padEnd(16, ' ')}
            </pre>
            <pre>{`zoom: ${camera.zoom.toFixed(2)}`.padEnd(16, ' ')}</pre>
          </div>
        </div>
      )}
    </>
  );
};

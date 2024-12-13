// @ts-ignore
// import * as THREE from 'three';
import { useCallback } from 'react';
import { SelectedObjectInfo } from 'old_src/components/ControlPanel/Controls/SelectedObjectInfo';
import { GeneralInfo } from 'old_src/components/ControlPanel/Controls/GeneralInfo';
import { TransformControls } from './Controls/TransformControls';
import { TransformControlsSpace } from './Controls/TransformControlsSpace';
import { Translate } from './Controls/Translate';
import { Position } from './Controls/Position';
import { Rotation } from './Controls/Rotation';
import { Scale } from './Controls/Scale';
import { useChangeTranslationDistance } from './Hooks/useChangeTranslationDistance';
import { useTranslate } from './Hooks/useTranslate';
import { useChangePosition } from './Hooks/useChangePosition';
import { useChangeRotation } from './Hooks/useChangeRotation';
import { useChangeScale } from './Hooks/useChangeScale';
import { CustomControlInput } from 'components/CustomControlInput/CustomControlInput';
import type { SceneObjects } from 'old_src/scene';
import './ControlPanel.css';

export interface ControlPanelProps {
  scene: SceneObjects;
}
function ControlPanel({ scene }: ControlPanelProps) {
  const customControls = scene.getCustomControls();
  const customControlsNames = Object.keys(customControls);
  const fps = scene.getFps();
  const selectedObject = scene.getSelectedObject() || null;
  const togglePlay = useCallback(() => {
    scene.getIsPlaying() ? scene.pause() : scene.play();
  }, [scene.getIsPlaying()]);

  const changeTranslationDistance = useChangeTranslationDistance({
    selectedObject
  });

  const translate = useTranslate({ selectedObject });

  const changePosition = useChangePosition({ selectedObject });

  const changeRotation = useChangeRotation({ selectedObject });

  const changeScale = useChangeScale({ selectedObject });

  return (
    <div className="control">
      <hr />
      <GeneralInfo scene={scene} />
      <hr />
      <div className="controlRow">
        <div
          className="rowEntry"
          style={{ cursor: 'pointer' }}
          onClick={togglePlay}
          title="Space"
        >
          {scene.getIsPlaying() ? `Pause ${fps}` : 'Play'}
        </div>
        <div
          className="rowEntry"
          style={{ cursor: 'pointer' }}
          onClick={scene.toggleShowScreenInfo}
          title="I"
        >
          {scene.getShowScreenInfo() ? 'Hide SInfo' : 'Show SInfo'}
        </div>
        <div
          className="rowEntry"
          style={{ cursor: 'pointer' }}
          onClick={scene.toggleAxisHelper}
          title="X"
        >
          {scene.getAxisHelper().visible ? 'Hide Axis' : 'Show Axis'}
        </div>
      </div>
      {!selectedObject ? null : (
        <>
          <hr />
          <SelectedObjectInfo selectedObject={selectedObject} />
          <hr />
          <TransformControlsSpace scene={scene} />
          <hr />
          <TransformControls scene={scene} />
          <hr />
          <Position
            selectedObject={selectedObject}
            changePosition={changePosition}
          />
          <hr />
          <Rotation
            selectedObject={selectedObject}
            changeRotation={changeRotation}
          />
          <hr />
          <Scale selectedObject={selectedObject} changeScale={changeScale} />
          <hr />
          <Translate
            translate={translate}
            changeTranslationDistance={changeTranslationDistance}
            selectedObject={selectedObject}
          />
        </>
      )}
      <>
        {customControlsNames.length && <hr />}
        {customControlsNames.map((name) => {
          const customControl = customControls[name];
          return (
            <div key={name} className="controlRow">
              <CustomControlInput className="rowEntry" {...customControl} />
            </div>
          );
        })}
      </>
    </div>
  );
}

export default ControlPanel;

import { useState, useEffect, useCallback } from 'react';
// import * as THREE from 'three';
// @ts-ignore
import { Info } from './Controls/Info';
import { TransformControls } from './Controls/TransformControls';
import { TransformControlsSpace } from './Controls/TransformControlsSpace';
import { Translate } from './Controls/Translate';
import { Position } from './Controls/Position';
import { Rotation } from './Controls/Rotation';
import { Scale } from './Controls/Scale';
import { useToggleCameraType } from './Hooks/useToggleCameraType';
import { useToggleTransformSpace } from './Hooks/useToggleTransformSpace';
import { useSetTransformMode } from './Hooks/useSetTransformMode';
import { useChangeTranslationDistance } from './Hooks/useChangeTranslationDistance';
import { useTranslate } from './Hooks/useTranslate';
import { useChangePosition } from './Hooks/useChangePosition';
import { useChangeRotation } from './Hooks/useChangeRotation';
import { useChangeScale } from './Hooks/useChangeScale';
import { CustomControlInput } from 'components/CustomControlInput/CustomControlInput.tsx';
import type { SceneObjects } from 'src/scene';
import {
  EVENT_TYPE,
  THREE_EVENT_TYPE,
  CUSTOM_CONTROL_EVENT_TYPE
} from 'src/constants';
import './ControlPanel.css';

export interface ControlPanelProps {
  scene: SceneObjects;
}
function ControlPanel({ scene }: ControlPanelProps) {
  const [, setUpdateNow] = useState(0);
  const customControls = scene.getCustomControls();
  const customControlsNames = Object.keys(customControls);
  const forceUpdate = useCallback(
    () =>
      setUpdateNow((state) => {
        return (state + 1) % 3;
      }),
    []
  );

  useEffect(() => {
    window.addEventListener('keydown', (_evt: KeyboardEvent) => {
      forceUpdate();
    });
    // @ts-ignore
    window.addEventListener(EVENT_TYPE.THREE, (evt: CustomEvent) => {
      if (evt.detail.type === THREE_EVENT_TYPE.OBJECT_SELECTED) {
        forceUpdate();
      } else if (
        evt.detail.type === THREE_EVENT_TYPE.SELECTED_OBJECT_TRANSFORM
      ) {
        forceUpdate();
      }
    });
    // The order this is fired is Scene, Scenario, ControlPanel
    // in the same order as ScenarioSelect initializes the scenario
    // @ts-ignore
    window.addEventListener(EVENT_TYPE.CUSTOM_CONTROL, (evt: CustomEvent) => {
      if (evt.detail.type === CUSTOM_CONTROL_EVENT_TYPE.CREATE) {
        forceUpdate();
      } else if (evt.detail.type === CUSTOM_CONTROL_EVENT_TYPE.VALUE_CHANGED) {
        forceUpdate();
      }
    });
  }, []);

  const cameraType = scene.getConfig().cameraType;
  const transformControls = scene.getTransformControls();
  const selectedObject = scene.getSelectedObject() || null;
  const togglePlay = useCallback(() => {
    scene.getIsPlaying() ? scene.pause() : scene.play();
    forceUpdate();
  }, [scene.getIsPlaying()]);

  const toggleCameraType = useToggleCameraType({ forceUpdate });
  const toggleTransformSpace = useToggleTransformSpace({
    scene,
    transformControls,
    forceUpdate
  });
  const setTransformMode = useSetTransformMode({
    transformControls,
    forceUpdate
  });

  const changeTranslationDistance = useChangeTranslationDistance({
    selectedObject,
    forceUpdate
  });

  const translate = useTranslate({ selectedObject, forceUpdate });

  const changePosition = useChangePosition({ selectedObject, forceUpdate });

  const changeRotation = useChangeRotation({ selectedObject, forceUpdate });

  const changeScale = useChangeScale({ selectedObject, forceUpdate });

  return (
    <div className="control">
      <div className="controlRow">
        <div
          className="rowEntry"
          style={{ cursor: 'pointer' }}
          onClick={toggleCameraType}
        >
          Camera type {cameraType}
        </div>
      </div>
      <hr />
      <div className="controlRow">
        <div
          className="rowEntry"
          style={{ cursor: 'pointer' }}
          onClick={togglePlay}
        >
          {scene.getIsPlaying() ? 'Pause' : 'Play'}
        </div>
      </div>
      {!selectedObject ? null : (
        <>
          <hr />
          <Info selectedObject={selectedObject} />
          <hr />
          <TransformControlsSpace
            transformControls={transformControls}
            toggleTransformSpace={toggleTransformSpace}
          />
          <hr />
          <TransformControls
            transformControls={transformControls}
            setTransformMode={setTransformMode}
          />
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

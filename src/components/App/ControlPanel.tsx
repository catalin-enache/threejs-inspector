/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { init } from 'src/scene';
import {
  EVENT_TYPE,
  THREE_EVENT_TYPE
  // CONTROL_EVENT_TYPE
} from 'src/constants';
import 'src/components/App/ControlPanel.css';

export interface ControlPanelProps {
  scene: ReturnType<typeof init>;
}
function ControlPanel({ scene }: ControlPanelProps) {
  const [, setUpdateNow] = useState(0);

  const forceUpdate = useCallback(
    () =>
      setUpdateNow((state) => {
        return (state + 1) % 3;
      }),
    []
  );

  useEffect(() => {
    window.addEventListener(EVENT_TYPE.THREE, (evt: any) => {
      if (evt.detail.type === THREE_EVENT_TYPE.OBJECT_SELECTED) {
        forceUpdate();
      } else if (evt.detail.type === THREE_EVENT_TYPE.OBJECT_TRANSFORM) {
        forceUpdate();
      }
    });
  }, []);

  const cameraType = scene.getConfig().cameraType;
  const transformControls = scene.getTransformControls();
  const selectedObject = scene.getSelectedObject() || null;

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
    </div>
  );
}

export default ControlPanel;

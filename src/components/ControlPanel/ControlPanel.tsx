import { useState, useEffect, useCallback, useRef } from 'react';
// import * as THREE from 'three';
// @ts-ignore
import { SelectedObjectInfo } from 'src/components/ControlPanel/Controls/SelectedObjectInfo';
import { GeneralInfo } from 'src/components/ControlPanel/Controls/GeneralInfo';
import { TransformControls } from './Controls/TransformControls';
import { TransformControlsSpace } from './Controls/TransformControlsSpace';
import { Translate } from './Controls/Translate';
import { Position } from './Controls/Position';
import { Rotation } from './Controls/Rotation';
import { Scale } from './Controls/Scale';
import { useToggleTransformSpace } from './Hooks/useToggleTransformSpace';
import { useSetTransformMode } from './Hooks/useSetTransformMode';
import { useChangeTranslationDistance } from './Hooks/useChangeTranslationDistance';
import { useTranslate } from './Hooks/useTranslate';
import { useChangePosition } from './Hooks/useChangePosition';
import { useChangeRotation } from './Hooks/useChangeRotation';
import { useChangeScale } from './Hooks/useChangeScale';
import { CustomControlInput } from 'components/CustomControlInput/CustomControlInput';
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
  const isInteracting = useRef(false);
  const forceUpdate = useCallback(
    () =>
      setUpdateNow((state) => {
        return (state + 1) % 100;
      }),
    []
  );

  const continuousUpdate = useCallback(() => {
    forceUpdate();
    isInteracting.current && requestAnimationFrame(continuousUpdate);
  }, []);

  const fps = scene.getFps();

  useEffect(() => {
    window.addEventListener('pointerdown', () => {
      isInteracting.current = true;
      continuousUpdate(); // in particular for space-bar Play/Pause camera view & type
    });
    window.addEventListener('pointerup', () => {
      isInteracting.current = false;
    });
    window.addEventListener('keydown', (_evt: KeyboardEvent) => {
      !isInteracting.current && forceUpdate();
    });
    window.addEventListener('wheel', (_evt: MouseEvent) => {
      !isInteracting.current && forceUpdate();
    });
    // @ts-ignore
    window.addEventListener(EVENT_TYPE.THREE, (evt: CustomEvent) => {
      if (evt.detail.type === THREE_EVENT_TYPE.OBJECT_SELECTED) {
        // updates standard controls from object transform matrix
        forceUpdate();
      } else if (
        evt.detail.type === THREE_EVENT_TYPE.SELECTED_OBJECT_TRANSFORM
      ) {
        // updates standard controls from object transform matrix
        forceUpdate();
      }
    });
    // The order this is fired is Scene, Scenario, ControlPanel
    // in the same order as ScenarioSelect initializes the scenario
    // @ts-ignore
    window.addEventListener(EVENT_TYPE.CUSTOM_CONTROL, (evt: CustomEvent) => {
      if (evt.detail.type === CUSTOM_CONTROL_EVENT_TYPE.CREATE) {
        // updates custom controls values
        forceUpdate();
      } else if (evt.detail.type === CUSTOM_CONTROL_EVENT_TYPE.VALUE_CHANGED) {
        // updates custom controls values
        forceUpdate();
      }
    });
  }, []);

  const transformControls = scene.getTransformControls();
  const selectedObject = scene.getSelectedObject() || null;
  const togglePlay = useCallback(() => {
    scene.getIsPlaying() ? scene.pause() : scene.play();
    forceUpdate();
  }, [scene.getIsPlaying()]);

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
      <GeneralInfo scene={scene} forceUpdate={forceUpdate} />
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
      </div>
      {!selectedObject ? null : (
        <>
          <hr />
          <SelectedObjectInfo selectedObject={selectedObject} />
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

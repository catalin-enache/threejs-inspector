/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useCallback } from 'react';
// import * as THREE from 'three';
// @ts-ignore
import { InputNumber } from './lib/react-components/InputNumber';
import { init } from './scene';
import {
  EVENT_TYPE,
  THREE_EVENT_TYPE,
  CONTROL_EVENT_TYPE
} from './constants.ts';
import './App.css';

export interface AppProps {
  scene: ReturnType<typeof init>;
}
function App({ scene }: AppProps) {
  // const [scene, setScene] = useState<ReturnType<typeof init> | null>(null);
  const [, setUpdateNow] = useState(0);

  const forceUpdate = useCallback(
    () =>
      setUpdateNow((state) => {
        return (state + 1) % 3;
      }),
    []
  );

  const cameraType = scene.getConfig().cameraType;
  const transformControls = scene.getTransformControls();
  const transformControlsSpace = transformControls.space;
  const selectedObject = scene.getSelectedObject() || null;

  const toggleCameraType = () => {
    window.dispatchEvent(
      new CustomEvent(EVENT_TYPE.CONTROL, {
        detail: { type: CONTROL_EVENT_TYPE.CAMERA_TYPE }
      })
    );
    forceUpdate();
  };

  const toggleTransformSpace = useCallback(() => {
    if (!scene) return;
    const newSpace = transformControls.space === 'local' ? 'world' : 'local';
    transformControls.setSpace(newSpace);
    forceUpdate();
  }, [scene, transformControls]);

  useEffect(() => {
    window.addEventListener(EVENT_TYPE.THREE, (evt: any) => {
      if (evt.detail.type === THREE_EVENT_TYPE.OBJECT_SELECTED) {
        forceUpdate();
      } else if (evt.detail.type === THREE_EVENT_TYPE.OBJECT_TRANSFORM) {
        forceUpdate();
      }
    });
  }, []);

  const setTransformMode = useCallback(
    (mode: 'translate' | 'rotate' | 'scale') => () => {
      transformControls.mode = mode;
      forceUpdate();
    },
    []
  );

  const changeTranslationDistance = useCallback(
    (coordinate: 'x' | 'y' | 'z') => (event: number) => {
      if (!selectedObject) return;
      selectedObject.userData.translationDistance = {
        ...selectedObject.userData.translationDistance,
        [coordinate]: event
      };
      forceUpdate();
    },
    [selectedObject]
  );

  const translate = useCallback(() => {
    if (!selectedObject) return;
    // const axis = new THREE.Vector3(
    //   selectedObject.userData.translationDistance?.x || 0,
    //   selectedObject.userData.translationDistance?.y || 0,
    //   selectedObject.userData.translationDistance?.z || 0
    // ).normalize();
    // selectedObject.translateOnAxis(axis, 1);

    selectedObject.translateX(
      selectedObject.userData.translationDistance?.x || 0
    );
    selectedObject.translateY(
      selectedObject.userData.translationDistance?.y || 0
    );
    selectedObject.translateZ(
      selectedObject.userData.translationDistance?.z || 0
    );

    forceUpdate();
  }, [selectedObject]);

  const changePosition = useCallback(
    (coordinate: 'x' | 'y' | 'z') => (event: number) => {
      if (!selectedObject) return;
      window.dispatchEvent(
        new CustomEvent(EVENT_TYPE.CONTROL, {
          detail: {
            type: CONTROL_EVENT_TYPE.OBJECT_TRANSFORM,
            object: {
              ...selectedObject,
              position: {
                ...selectedObject.position,
                [coordinate]: event
              }
            }
          }
        })
      );
      // Object3D has just been updated from previous dispatched Event,
      // so we force a re-render to update the UI
      forceUpdate();
    },
    [selectedObject]
  );

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
          <div className="controlRow">
            <div className="rowEntry">Control {selectedObject.name}</div>
          </div>
          <div className="controlRow">
            <div className="rowEntry">{selectedObject.uuid}</div>
          </div>
          <hr />
          <div
            className="controlRow"
            style={{ cursor: 'pointer' }}
            onClick={toggleTransformSpace}
          >
            <div className="rowEntry">
              Controls space: {transformControlsSpace}
            </div>
          </div>
          <hr />
          <div className="controlRow">
            <div className="rowTitle">Controls</div>
            <div
              className={`rowEntry controlTab ${
                transformControls.mode === 'translate' ? 'active' : ''
              }`}
              onClick={setTransformMode('translate')}
            >
              Translate
            </div>
            <div
              className={`rowEntry controlTab ${
                transformControls.mode === 'rotate' ? 'active' : ''
              }`}
              onClick={setTransformMode('rotate')}
            >
              Rotate
            </div>
            <div
              className={`rowEntry controlTab ${
                transformControls.mode === 'scale' ? 'active' : ''
              }`}
              onClick={setTransformMode('scale')}
            >
              Scale
            </div>
          </div>
          <hr />
          <div className="controlRow">
            <div className="rowTitle">Position</div>
            <InputNumber
              className="rowEntry"
              label="X"
              value={selectedObject.position.x}
              onChange={changePosition('x')}
            />
            <InputNumber
              className="rowEntry"
              label="Y"
              value={selectedObject.position.y}
              onChange={changePosition('y')}
            />
            <InputNumber
              className="rowEntry"
              label="Z"
              value={selectedObject.position.z}
              onChange={changePosition('z')}
            />
          </div>
          <hr />
          <div className="controlRow">
            <div className="rowTitle">Translate</div>
            <InputNumber
              className="rowEntry"
              label="X"
              value={selectedObject.userData.translationDistance?.x || 0}
              onChange={changeTranslationDistance('x')}
            />
            <InputNumber
              className="rowEntry"
              label="Y"
              value={selectedObject.userData.translationDistance?.y || 0}
              onChange={changeTranslationDistance('y')}
            />
            <InputNumber
              className="rowEntry"
              label="Z"
              value={selectedObject.userData.translationDistance?.z || 0}
              onChange={changeTranslationDistance('z')}
            />
          </div>
          <div className="controlRow">
            <div className="rowEntry controlButton" onClick={translate}>
              Apply
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;

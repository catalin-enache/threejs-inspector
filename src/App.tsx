/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { InputNumber } from './lib/react-components/InputNumber';
import {
  EVENT_TYPE,
  THREE_EVENT_TYPE,
  CONTROL_EVENT_TYPE
} from './constants.ts';
import './App.css';

function App() {
  const [, setUpdateNow] = useState(0);
  const [cameraType, setCameraType] = useState(false);
  const [selectedObject, setSelectedObject] = useState<THREE.Object3D | null>(
    null
  );

  const forceUpdate = useCallback(
    () =>
      setUpdateNow((state) => {
        return (state + 1) % 3;
      }),
    []
  );
  const toggleCameraType = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCameraType(event.target.checked);
    window.dispatchEvent(
      new CustomEvent(EVENT_TYPE.CONTROL, {
        detail: { type: CONTROL_EVENT_TYPE.CAMERA_TYPE }
      })
    );
  };

  useEffect(() => {
    window.addEventListener(EVENT_TYPE.THREE, (evt: any) => {
      if (evt.detail.type === THREE_EVENT_TYPE.OBJECT_SELECTED) {
        setSelectedObject(evt.detail.object);
      } else if (evt.detail.type === THREE_EVENT_TYPE.OBJECT_CHANGE) {
        forceUpdate();
      }
    });
  }, []);

  const changePosition = useCallback(
    (coordinate: 'x' | 'y' | 'z') => (event: number) => {
      if (!selectedObject) return;
      window.dispatchEvent(
        new CustomEvent(EVENT_TYPE.CONTROL, {
          detail: {
            type: CONTROL_EVENT_TYPE.SELECTED_OBJECT_TRANSFORM,
            value: {
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
    [selectedObject?.name]
  );

  return (
    <div className="control">
      <div className="controlRow">
        <label className="rowEntry">
          Switch Camera
          <input
            type="checkbox"
            checked={cameraType}
            onChange={toggleCameraType}
          />
        </label>
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
        </>
      )}
    </div>
  );
}

export default App;

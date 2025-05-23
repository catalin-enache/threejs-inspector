import * as THREE from 'three';
import type { Config } from 'old_src/config';
import type { SceneObjects } from 'old_src/scene';
import {
  CUSTOM_CONTROL_EVENT_TYPE,
  // CUSTOM_CONTROL_EVENT_TYPE,
  EVENT_TYPE
  // STANDARD_CONTROL_EVENT_TYPE,
  // THREE_EVENT_TYPE
} from 'old_src/constants';
// import type { CustomInfoControl } from 'src/types';
// import { Line } from 'lib/three/Line';
import { CustomInfoControl, UserData } from 'old_src/types';
import { Point } from 'lib/three/Point';

export const setConfig = (config: Config) => {
  config.cameraType = 'orthographic';
  config.orthographicCameraRatio = 100;
  config.controlPanelExpanded = true;
  return config;
};

export default (sceneObjects: SceneObjects) => {
  const {
    scene,
    // getTransformControls,
    loop,
    // pointer,
    // sceneSize,
    // getCamera,
    // getHit,
    addCustomControl,
    changeCustomControlValue,
    addScreenInfo,
    changeScreenInfoValue
    // getClock,
    // getDelta,
    // getInteractiveObjects
  } = sceneObjects;

  // @ts-ignore
  window.addEventListener(EVENT_TYPE.CUSTOM_CONTROL, (evt: CustomEvent) => {
    if (evt.detail.type === CUSTOM_CONTROL_EVENT_TYPE.VALUE_CHANGED) {
      // console.log(evt.detail.type, evt.detail.name, evt.detail.value);
    }
  });

  const size = 1;

  const p0 = new THREE.Mesh(
    new THREE.BoxGeometry(size, size, size),
    new THREE.MeshBasicMaterial({ color: 0xcc0000 })
  );
  p0.name = 'p0';
  p0.position.set(0, 0, 0);
  (p0.userData as UserData).isInteractive = true;
  scene.add(p0);

  const p1 = new THREE.Mesh(
    new THREE.BoxGeometry(size, size, size),
    new THREE.MeshBasicMaterial({ color: 0x00cc00 })
  );
  p1.name = 'p1';
  p1.position.set(0, -3, 0);
  (p1.userData as UserData).isInteractive = true;
  (p1.userData as UserData).lineTo = {
    object: p0,
    color: 0xffff00,
    infoOptions: { delta: true, distance: true, color: 0xffffff }
  };
  scene.add(p1);

  const p2 = new THREE.Mesh(
    new THREE.BoxGeometry(size, size, size),
    new THREE.MeshBasicMaterial({ color: 0x0000cc })
  );
  p2.name = 'p2';
  p2.position.set(3, 0, 0);
  (p2.userData as UserData).isInteractive = true;
  (p2.userData as UserData).lineTo = {
    object: p0,
    color: 0xffff00,
    infoOptions: { delta: true, distance: true, color: 0xffffff }
  };
  scene.add(p2);

  const crossProductPoint = new Point(0x00ffff, 5);
  scene.add(crossProductPoint);

  addScreenInfo({
    linkObject: p0,
    name: 'P0',
    value: '?',
    position: { x: 0, y: 0 },
    // size: { width: 40, height: 40 },
    color: { bg: 'rgba(0,0,0,0)', fg: 'white' }
  });

  addScreenInfo({
    linkObject: p1,
    name: 'P1',
    value: '?',
    position: { x: 0, y: 0 },
    // size: { width: 40, height: 40 },
    color: { bg: 'rgba(0,0,0,0)', fg: 'white' }
  });

  addScreenInfo({
    linkObject: p2,
    name: 'P2',
    value: '?',
    position: { x: 0, y: 0 },
    // size: { width: 40, height: 40 },
    color: { bg: 'rgba(0,0,0,0)', fg: 'white' }
  });

  addCustomControl<CustomInfoControl>({
    type: 'info',
    name: 'CrossProduct',
    label: 'CrossProduct',
    value: '?'
  });

  const tick = () => {
    const p1Pos = p1.position.clone().sub(p0.position);
    const p2Pos = p2.position.clone().sub(p0.position);
    const p1PosAsUnitVector = p1Pos.clone().normalize();
    const p2PosAsUnitVector = p2Pos.clone().normalize();
    const cosAngle = p1PosAsUnitVector.dot(p2PosAsUnitVector);
    const angleInRadians = Math.acos(cosAngle);
    const degrees = (angleInRadians * 180) / Math.PI;
    const crossProduct = p1Pos.cross(p2Pos);
    crossProductPoint.position.copy(crossProduct).add(p0.position);

    changeCustomControlValue(
      'CrossProduct',
      crossProductPoint.position
        .toArray()
        .map((e) => e.toFixed(2))
        .join(', ')
    );

    changeScreenInfoValue(
      'P1',
      `
x: ${p1.position.x.toFixed(2)}
y: ${p1.position.y.toFixed(2)}
z: ${p1.position.z.toFixed(2)}
`.trim()
    );

    changeScreenInfoValue(
      'P2',
      `
x: ${p2.position.x.toFixed(2)}
y: ${p2.position.y.toFixed(2)}
z: ${p2.position.z.toFixed(2)}
`.trim()
    );
    changeScreenInfoValue(
      'P0',
      `
x: ${p0.position.x.toFixed(2)}
y: ${p0.position.y.toFixed(2)}
z: ${p0.position.z.toFixed(2)}
${degrees.toFixed(2)}°
`.trim()
    );
  };
  loop(tick);
};

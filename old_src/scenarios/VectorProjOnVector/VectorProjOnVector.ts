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
import { CustomInfoControl, CustomSelectControl, UserData } from 'old_src/types';
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
      if (evt.detail.name === 'Variant') {
        variant.current = evt.detail.value;
      }
      console.log(evt.detail.type, evt.detail.name, evt.detail.value);
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
  p1.position.set(0, 4, 0);
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
  p2.position.set(4, 0, 0);
  (p2.userData as UserData).isInteractive = true;
  (p2.userData as UserData).lineTo = {
    object: p0,
    color: 0xffff00,
    infoOptions: { delta: true, distance: true, color: 0xffffff }
  };
  scene.add(p2);

  const p1ProjOnP2Point = new Point(0x00ffff, 5);
  const p2ProjOnP1Point = new Point(0x00ffff, 5);
  scene.add(p1ProjOnP2Point);
  scene.add(p2ProjOnP1Point);

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

  addCustomControl<CustomSelectControl>({
    type: 'select',
    name: 'Variant',
    label: 'Variant',
    value: 'usingCos',
    options: ['usingCos', 'usingSquareMagnitude']
  });

  addCustomControl<CustomInfoControl>({
    type: 'info',
    name: 'P1ProjOnP2',
    label: 'P1ProjOnP2',
    value: '?'
  });

  addCustomControl<CustomInfoControl>({
    type: 'info',
    name: 'P2ProjOnP1',
    label: 'P2ProjOnP1',
    value: '?'
  });

  const variant = { current: 'usingCos' };

  const tick = () => {
    const p1Pos = p1.position.clone().sub(p0.position);
    const p2Pos = p2.position.clone().sub(p0.position);
    const p1PosAsUnitVector = p1Pos.clone().normalize();
    const p2PosAsUnitVector = p2Pos.clone().normalize();
    const cosAngle = p1PosAsUnitVector.dot(p2PosAsUnitVector);
    const angleInRadians = Math.acos(cosAngle);
    const degrees = (angleInRadians * 180) / Math.PI;

    if (variant.current === 'usingCos') {
      const p1CompOnP2 = p1Pos.length() * cosAngle;
      const p1ProjOnP2 = p2PosAsUnitVector
        .clone()
        .multiplyScalar(p1CompOnP2)
        .add(p0.position);
      p1ProjOnP2Point.position.copy(p1ProjOnP2);

      const p2CompOnP1 = p2Pos.length() * cosAngle;
      const p2ProjOnP1 = p1PosAsUnitVector
        .clone()
        .multiplyScalar(p2CompOnP1)
        .add(p0.position);
      p2ProjOnP1Point.position.copy(p2ProjOnP1);
    } else {
      const dotProduct = p1Pos.dot(p2Pos);

      const squareMagnitudeP1 = p1Pos.dot(p1Pos);
      const p2ProjOnP1 = p1Pos
        .clone()
        .multiplyScalar(dotProduct / squareMagnitudeP1)
        .add(p0.position);
      p2ProjOnP1Point.position.copy(p2ProjOnP1);

      const squareMagnitudeP2 = p2Pos.dot(p2Pos);
      const p1ProjOnP2 = p2Pos
        .clone()
        .multiplyScalar(dotProduct / squareMagnitudeP2)
        .add(p0.position);
      p1ProjOnP2Point.position.copy(p1ProjOnP2);
    }

    changeCustomControlValue(
      'P1ProjOnP2',
      p1ProjOnP2Point.position
        .toArray()
        .map((e) => e.toFixed(2))
        .join(', ')
    );

    changeCustomControlValue(
      'P2ProjOnP1',
      p2ProjOnP1Point.position
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

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export const getPatchedOrbitControls = (
  camera: THREE.Camera,
  canvas: HTMLCanvasElement,
  { usePointerLock = true } = {}
) => {
  const instance = new OrbitControls(camera, canvas) as any;

  if (!usePointerLock) return instance;

  instance.disconnect();
  const _onPointerDown = instance._onPointerDown; // already bound
  const _onPointerMove = instance._onPointerMove; // already bound
  const _onPointerUp = instance._onPointerUp; // already bound

  instance._onPointerDown = (event: MouseEvent) => {
    _onPointerDown(event); // setPointerCapture
    if (event.button === 2) {
      // need to be button 2 so that LMB double click still works to select objects
      instance.domElement.requestPointerLock({ unadjustedMovement: true });
      instance.locked = true;
      instance.cx = event.clientX;
      instance.cy = event.clientY;
      instance.px = event.pageX;
      instance.py = event.pageY;
    }
  };

  instance._onPointerMove = (event: MouseEvent) => {
    if (instance.locked) {
      instance.cx += event.movementX;
      instance.cy += event.movementY;
      instance.px += event.movementX;
      instance.py += event.movementY;
      event = { ...event, clientX: instance.cx, clientY: instance.cy, pageX: instance.px, pageY: instance.py };
    }
    _onPointerMove(event);
  };

  instance._onPointerUp = (event: MouseEvent) => {
    if (event.button === 2) {
      instance.domElement!.ownerDocument.exitPointerLock();
      instance.locked = false;
    }
    _onPointerUp(event); // releasePointerCapture
  };

  instance.connect();
  return instance as OrbitControls;
};

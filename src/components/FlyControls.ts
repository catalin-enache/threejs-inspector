import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { getSceneBoundingBoxSize } from 'lib/utils/sizeUtils';
import { useAppStore } from 'src/store';

const center = new THREE.Vector3(0, 0, 0);
let targetPosition = center.clone();

const setupFlyControls = (
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera,
  scene: THREE.Scene,
  clock: THREE.Clock
) => {
  let moveForward = false;
  let moveBackward = false;
  let moveLeft = false;
  let moveRight = false;
  let moveUp = false;
  let moveDown = false;

  let angleX = 0;
  let angleY = 0;
  let radius = 0;

  let isMouseButton0 = false;
  let isMouseButton1 = false;
  let isMouseButton2 = false;

  const mouseDelta = new THREE.Vector2(0, 0); // Raw input
  const easedDelta = new THREE.Vector2(0, 0); // Eased input
  const rotationVelocity = new THREE.Vector2(0, 0);

  const sceneBoundingBox = getSceneBoundingBoxSize(scene, camera);
  const sceneSize = Math.max(sceneBoundingBox.x, sceneBoundingBox.y, sceneBoundingBox.z);
  const ratio = sceneSize / 23; // 23 is the scene size the defaults were tested with

  const flyCameraEnabled = { current: false };
  const speed = { current: 0.05 * ratio };
  const euler = new THREE.Euler(0, 0, 0, 'YXZ');
  const cameraDirection = new THREE.Vector3();
  const rightVector = new THREE.Vector3();

  let animFrameId: ReturnType<typeof requestAnimationFrame> | null = null;
  const update = (cb: () => boolean) => {
    if (animFrameId) {
      console.log('cancelAnimationFrame 1');
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    const keepUpdating = () => {
      const shouldKeepUpdating = cb();
      if (shouldKeepUpdating) {
        animFrameId = requestAnimationFrame(keepUpdating);
      } else {
        console.log('cancelAnimationFrame 2');
        animFrameId && cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
    };
    keepUpdating();
  };

  // TODO: maybe we can find a way to make it more smooth (look into OrbitControls source code)
  // move camera wasd/qe
  const flyCamera = () => {
    // this will only fire if frameloop is not 'never'
    if (!flyCameraEnabled.current) return;

    camera.getWorldDirection(cameraDirection); // Get the forward vector
    cameraDirection.normalize();

    rightVector.crossVectors(cameraDirection, camera.up).normalize(); // Get right vector

    if (moveForward) {
      if (camera instanceof THREE.OrthographicCamera) {
        camera.zoom += speed.current;
        camera.updateProjectionMatrix();
      } else {
        camera.position.addScaledVector(cameraDirection, speed.current);
      }
    }
    if (moveBackward) {
      if (camera instanceof THREE.OrthographicCamera) {
        camera.zoom -= speed.current;
        camera.updateProjectionMatrix();
      } else {
        camera.position.addScaledVector(cameraDirection, -speed.current);
      }
    }
    if (moveLeft) {
      camera.position.addScaledVector(rightVector, -speed.current);
    }
    if (moveRight) {
      camera.position.addScaledVector(rightVector, speed.current);
    }
    if (moveUp) {
      camera.position.y -= speed.current;
    }
    if (moveDown) {
      camera.position.y += speed.current;
    }
  };

  const handleKeyDown = (evt: KeyboardEvent) => {
    const distance = camera.position.length();
    const adjustCamera = () => {
      camera.lookAt(targetPosition);
      camera.updateProjectionMatrix();
      camera.getWorldDirection(cameraDirection);
      cameraDirection.normalize();
    };
    switch (evt.code) {
      case 'KeyW':
        moveForward = true;
        break;
      case 'KeyA':
        moveLeft = true;
        break;
      case 'KeyS':
        moveBackward = true;
        break;
      case 'KeyD':
        moveRight = true;
        break;
      case 'KeyQ':
        moveUp = true;
        break;
      case 'KeyE':
        moveDown = true;
        break;
      case 'KeyF':
        targetPosition = useAppStore.getState().getSelectedObject()?.position.clone() ?? center.clone();
        adjustCamera();
        break;
      case 'Numpad1':
        // front
        targetPosition = center.clone();
        camera.position.set(0, 0, distance);
        adjustCamera();
        break;
      case 'Numpad7':
        // top
        targetPosition = center.clone();
        camera.position.set(0, distance, 0.01);
        adjustCamera();
        break;
      case 'Numpad3':
        // right
        targetPosition = center.clone();
        camera.position.set(distance, 0, 0);
        adjustCamera();
        break;
      case 'Numpad9':
        // inverse
        targetPosition = center.clone();
        camera.position.negate();
        adjustCamera();
        break;
    }
  };

  const handleKeyUp = (evt: KeyboardEvent) => {
    switch (evt.code) {
      case 'KeyW':
        moveForward = false;
        break;
      case 'KeyA':
        moveLeft = false;
        break;
      case 'KeyS':
        moveBackward = false;
        break;
      case 'KeyD':
        moveRight = false;
        break;
      case 'KeyQ':
        moveUp = false;
        break;
      case 'KeyE':
        moveDown = false;
        break;
    }
  };

  const handleMouseDown = (evt: MouseEvent) => {
    if (evt.button === 0) {
      isMouseButton0 = true;
    } else if (evt.button === 1) {
      isMouseButton1 = true;
    } else if (evt.button === 2) {
      isMouseButton2 = true;
    }

    animFrameId && cancelAnimationFrame(animFrameId);
    animFrameId = null;

    flyCameraEnabled.current = true;

    const offset = new THREE.Vector3().subVectors(camera.position, targetPosition);
    const spherical = new THREE.Spherical().setFromVector3(offset);
    spherical.phi = Math.max(0, Math.min(Math.PI, spherical.phi));
    spherical.makeSafe();
    radius = spherical.radius;
    angleX = spherical.phi; // vertical
    angleY = spherical.theta; // horizontal

    if (isMouseButton1 || isMouseButton2) {
      // @ts-ignore
      document.body.requestPointerLock({ unadjustedMovement: true });
    }
  };

  const handleMouseUp = () => {
    flyCameraEnabled.current = false;
    isMouseButton0 = false;
    isMouseButton1 = false;
    isMouseButton2 = false;
    document.exitPointerLock();
  };

  // on mouse move rotate camera
  const handleMouseMove = (evt: MouseEvent) => {
    if (!flyCameraEnabled.current) return;

    const sensitivity = 0.005;
    const movementX = evt.movementX * sensitivity;
    const movementY = evt.movementY * sensitivity;

    mouseDelta.x -= evt.movementX;
    mouseDelta.y -= evt.movementY;

    // orbit
    if (isMouseButton0) {
      const dampingFactor = 50;
      angleY -= movementX; // horizontal drag
      angleX -= movementY; // vertical drag

      const spherical = new THREE.Spherical(radius, angleX, angleY);
      spherical.makeSafe();
      // prevent camera oscillating at poles
      spherical.phi = Math.max(0.01, Math.min(Math.PI - 0.01, spherical.phi));

      const newPos = new THREE.Vector3().setFromSpherical(spherical).add(targetPosition);

      update(() => {
        const dt = clock.getDelta();

        const newPosSmoothX = THREE.MathUtils.damp(camera.position.x, newPos.x, dampingFactor, dt);
        const newPosSmoothY = THREE.MathUtils.damp(camera.position.y, newPos.y, dampingFactor, dt);
        const newPosSmoothZ = THREE.MathUtils.damp(camera.position.z, newPos.z, dampingFactor, dt);
        camera.position.x = newPosSmoothX;
        camera.position.y = newPosSmoothY;
        camera.position.z = newPosSmoothZ;
        camera.lookAt(targetPosition);
        return (
          Math.abs(camera.position.x - newPos.x) > 0.0001 &&
          Math.abs(camera.position.y - newPos.y) > 0.0001 &&
          Math.abs(camera.position.z - newPos.z) > 0.0001
        );
      });

      // pan
    } else if (isMouseButton1) {
      // Right (local X)
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
      // Up (local Y)
      const up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);

      // Move the camera along with target
      camera.position.addScaledVector(right, -movementX * ratio);
      camera.position.addScaledVector(up, movementY * ratio);
      targetPosition.addScaledVector(right, -movementX * ratio);
      targetPosition.addScaledVector(up, movementY * ratio);
      camera.lookAt(targetPosition);

      // wasd fly
    } else if (isMouseButton2) {
      const inputEase = 100; // Increase for snappier input, decrease for smoother
      const rotationEase = 100; // Controls how fast camera turns

      euler.setFromQuaternion(camera.quaternion);
      update(() => {
        const dt = clock.getDelta();

        // Easing the raw mouse delta
        easedDelta.x = THREE.MathUtils.damp(easedDelta.x, mouseDelta.x, inputEase, dt);
        easedDelta.y = THREE.MathUtils.damp(easedDelta.y, mouseDelta.y, inputEase, dt);

        // Apply eased delta to rotation target velocity
        const sensitivity = 0.002;
        rotationVelocity.x = THREE.MathUtils.damp(rotationVelocity.x, easedDelta.x * sensitivity, rotationEase, dt);
        rotationVelocity.y = THREE.MathUtils.damp(rotationVelocity.y, easedDelta.y * sensitivity, rotationEase, dt);

        // Apply rotation
        // euler.setFromQuaternion(camera.quaternion);
        euler.y += rotationVelocity.x;
        euler.x += rotationVelocity.y;

        // Clamp pitch (X axis)
        const maxPitch = Math.PI / 2 - 0.01;
        const minPitch = -maxPitch;
        euler.x = THREE.MathUtils.clamp(euler.x, minPitch, maxPitch);

        // Apply to camera
        camera.quaternion.setFromEuler(euler);

        // Forward direction (camera's -Z axis in world space)
        const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        // Scale by desired distance (or keep original distance from old target)
        const distance = camera.position.distanceTo(targetPosition);
        direction.multiplyScalar(distance);
        // Move Target
        targetPosition.copy(camera.position).add(direction);

        // Decay raw delta after applying it
        mouseDelta.set(0, 0);
        // return true;
        return (
          Math.abs(mouseDelta.x - easedDelta.x) > 0.000000001 && Math.abs(mouseDelta.y - easedDelta.y) > 0.000000001
        );
      });
    }
  };

  // on mouse wheel change speed or zoom
  const handleMouseWheel = (evt: WheelEvent) => {
    if (isMouseButton2) {
      speed.current -= evt.deltaY * 0.00005 * ratio;
      speed.current = Math.max(0.000001, speed.current);
    } else if (evt.altKey) {
      if (camera instanceof THREE.OrthographicCamera) {
        camera.zoom += -evt.deltaY * 0.005 * ratio;
        camera.updateProjectionMatrix();
      } else {
        camera.position.addScaledVector(cameraDirection, -evt.deltaY * 0.005 * ratio);
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  window.addEventListener('mousedown', handleMouseDown);
  window.addEventListener('mouseup', handleMouseUp);
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('wheel', handleMouseWheel);

  const cleanup = () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    window.removeEventListener('mousedown', handleMouseDown);
    window.removeEventListener('mouseup', handleMouseUp);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('wheel', handleMouseWheel);
  };

  return {
    flyCamera,
    cleanup
  };
};

// TODO: improve this to fly when frameloop is 'demand'

export const FlyControls = () => {
  const { camera, scene, clock } = useThree();
  const flyCameraRef = useRef<(() => void) | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    cleanupRef.current?.();
    const { flyCamera, cleanup } = setupFlyControls(camera, scene, clock);
    flyCameraRef.current = flyCamera;
    cleanupRef.current = cleanup;
  }, [camera, scene]);

  useFrame((_state, _delta) => {
    flyCameraRef.current && flyCameraRef.current();
  });

  useEffect(() => () => cleanupRef.current?.(), []);

  return null;
};

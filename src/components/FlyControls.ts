import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { getSceneBoundingBoxSize, getWorldScreenRatio } from 'lib/utils/sizeUtils';
import { useAppStore } from 'src/store';

const center = new THREE.Vector3(0, 0, 0);
let targetPosition = center.clone();
const clock = new THREE.Clock();

const setupFlyControls = ({
  camera,
  renderer,
  scene
}: {
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
}) => {
  let moveForward = false;
  let moveBackward = false;
  let moveLeft = false;
  let moveRight = false;
  let moveUp = false;
  let moveDown = false;

  let angleX = 0;
  let angleY = 0;
  let cameraDistance = 0;

  const mouseButton = {
    current: null as number | null
  };

  const mouseDelta = new THREE.Vector2(0, 0); // Raw input
  const mouseDeltaSmooth = new THREE.Vector2(0, 0); // Raw input smooth
  const easedDelta = new THREE.Vector2(0, 0); // Eased input
  const flyRotationVelocity = new THREE.Vector2(0, 0);
  const orbitMovementVelocity = new THREE.Vector2(0, 0);

  let sceneBoundingBox = new THREE.Vector3();
  let sceneSize = 0.01;
  let ratio = 0.01; // 23 is the scene size the defaults were tested with

  // TODO: should update scene size when objects are added/removed and not on mouseDown
  const updateSceneSize = () => {
    sceneBoundingBox = getSceneBoundingBoxSize(scene, camera);
    sceneSize = Math.max(sceneBoundingBox.x, sceneBoundingBox.y, sceneBoundingBox.z);
    ratio = sceneSize / 23;
  };
  updateSceneSize();

  const flyCameraEnabled = { current: false };
  const flyEuler = new THREE.Euler(0, 0, 0, 'YXZ');
  const speed = { current: 0.05 * ratio };
  const cameraDirection = new THREE.Vector3();
  const rightVector = new THREE.Vector3();

  const animationFrameId = {
    current: null as ReturnType<typeof requestAnimationFrame> | null
  };
  const update = (cb: () => boolean) => {
    if (animationFrameId.current) {
      console.log('cancelAnimationFrame 1');
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    const keepUpdating = () => {
      const shouldKeepUpdating = cb();
      if (shouldKeepUpdating) {
        animationFrameId.current = requestAnimationFrame(keepUpdating);
      } else {
        cancelUpdate();
      }
    };
    keepUpdating();
  };

  const cancelUpdate = () => {
    if (animationFrameId.current) {
      console.log('cancelAnimationFrame 2');
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
  };

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
        if (mouseButton.current === 2) {
          moveForward = true;
        }
        break;
      case 'KeyA':
        if (mouseButton.current === 2) {
          moveLeft = true;
        }
        break;
      case 'KeyS':
        if (mouseButton.current === 2) {
          moveBackward = true;
        }
        break;
      case 'KeyD':
        if (mouseButton.current === 2) {
          moveRight = true;
        }
        break;
      case 'KeyQ':
        if (mouseButton.current === 2) {
          moveUp = true;
        }
        break;
      case 'KeyE':
        if (mouseButton.current === 2) {
          moveDown = true;
        }
        break;
      case 'KeyF':
        targetPosition = useAppStore.getState().getSelectedObject()?.position.clone() ?? center.clone();
        adjustCamera();
        break;
      case 'Numpad1':
        // front
        cancelUpdate();
        targetPosition = center.clone();
        camera.position.set(0, 0, distance);
        adjustCamera();
        break;
      case 'Numpad7':
        // top
        cancelUpdate();
        targetPosition = center.clone();
        camera.position.set(-0.01, distance, -0.01);
        adjustCamera();
        break;
      case 'Numpad3':
        // right
        cancelUpdate();
        targetPosition = center.clone();
        camera.position.set(distance, 0, 0);
        adjustCamera();
        break;
      case 'Numpad9':
        // inverse
        cancelUpdate();
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
    mouseButton.current = evt.button;
    clock.getDelta();
    updateSceneSize();
    cancelUpdate();

    flyCameraEnabled.current = true;

    const offset = new THREE.Vector3().subVectors(camera.position, targetPosition);
    const spherical = new THREE.Spherical().setFromVector3(offset);
    spherical.makeSafe();
    spherical.phi = Math.max(0.01, Math.min(Math.PI - 0.01, spherical.phi));
    cameraDistance = spherical.radius;
    angleX = spherical.phi; // vertical
    angleY = spherical.theta; // horizontal

    if (mouseButton.current === 1 || mouseButton.current === 2) {
      // @ts-ignore
      document.body.requestPointerLock({ unadjustedMovement: true });
    }
  };

  const handleMouseUp = () => {
    flyCameraEnabled.current = false;
    mouseButton.current = null;
    document.exitPointerLock();
  };

  // on mouse move rotate camera
  const handleMouseMove = (evt: MouseEvent) => {
    if (!flyCameraEnabled.current) return;

    // pan
    if (mouseButton.current === 1) {
      const sensitivity =
        getWorldScreenRatio({
          camera,
          renderer,
          targetPosition
        }) / 2;

      const movementX = evt.movementX * sensitivity;
      const movementY = evt.movementY * sensitivity;

      // Right (local X)
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
      // Up (local Y)
      const up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);

      const panOffset = right.multiplyScalar(-movementX).add(up.multiplyScalar(movementY));

      camera.position.add(panOffset);
      targetPosition.add(panOffset);
      camera.lookAt(targetPosition);
    }
    // orbit
    else if (mouseButton.current === 0) {
      const inputEase = 30; // Increase for snappier input, decrease for smoother
      const rotationEase = 30; // Controls how fast camera turns

      mouseDelta.x -= evt.movementX;
      mouseDelta.y -= evt.movementY;

      update(() => {
        const dt = clock.getDelta();

        // Easing the raw mouse delta
        // One-frame input injection with smoothed output over time (eas-out)
        mouseDeltaSmooth.x = THREE.MathUtils.damp(mouseDeltaSmooth.x, mouseDelta.x, inputEase, dt);
        mouseDeltaSmooth.y = THREE.MathUtils.damp(mouseDeltaSmooth.y, mouseDelta.y, inputEase, dt);

        easedDelta.x = THREE.MathUtils.damp(easedDelta.x, mouseDeltaSmooth.x, inputEase, dt);
        easedDelta.y = THREE.MathUtils.damp(easedDelta.y, mouseDeltaSmooth.y, inputEase, dt);

        // Decay raw delta after applying it
        mouseDelta.set(0, 0);

        // Apply eased delta to rotation target velocity
        const sensitivity = 0.01;
        orbitMovementVelocity.x = THREE.MathUtils.damp(
          orbitMovementVelocity.x,
          easedDelta.y * sensitivity,
          rotationEase,
          dt
        );
        orbitMovementVelocity.y = THREE.MathUtils.damp(
          orbitMovementVelocity.y,
          easedDelta.x * sensitivity,
          rotationEase,
          dt
        );

        angleY += orbitMovementVelocity.y; // horizontal drag
        angleX += orbitMovementVelocity.x; // vertical drag

        const spherical = new THREE.Spherical(cameraDistance, angleX, angleY);
        spherical.makeSafe();
        // prevent camera jittering at poles
        spherical.phi = Math.max(0.01, Math.min(Math.PI - 0.01, spherical.phi));

        const newPos = new THREE.Vector3().setFromSpherical(spherical).add(targetPosition);

        camera.position.x = newPos.x;
        camera.position.y = newPos.y;
        camera.position.z = newPos.z;
        camera.lookAt(targetPosition);

        return Math.abs(easedDelta.x) > 0.000000001 && Math.abs(easedDelta.y) > 0.000000001;
      });
    }
    // fly wasd/qe
    else if (mouseButton.current === 2) {
      const inputEase = 30; // Increase for snappier input, decrease for smoother
      const rotationEase = 30; // Controls how fast camera turns

      mouseDelta.x -= evt.movementX;
      mouseDelta.y -= evt.movementY;

      // this needs to stay outside the update loop to prevent jittering
      flyEuler.setFromQuaternion(camera.quaternion);

      update(() => {
        const dt = clock.getDelta();

        mouseDeltaSmooth.x = THREE.MathUtils.damp(mouseDeltaSmooth.x, mouseDelta.x, inputEase, dt);
        mouseDeltaSmooth.y = THREE.MathUtils.damp(mouseDeltaSmooth.y, mouseDelta.y, inputEase, dt);

        easedDelta.x = THREE.MathUtils.damp(easedDelta.x, mouseDeltaSmooth.x, inputEase, dt);
        easedDelta.y = THREE.MathUtils.damp(easedDelta.y, mouseDeltaSmooth.y, inputEase, dt);

        // Decay raw delta after applying it
        mouseDelta.set(0, 0);

        // Apply eased delta to rotation target velocity
        const sensitivity = 0.01;
        flyRotationVelocity.x = THREE.MathUtils.damp(
          flyRotationVelocity.x,
          easedDelta.x * sensitivity,
          rotationEase,
          dt
        );
        flyRotationVelocity.y = THREE.MathUtils.damp(
          flyRotationVelocity.y,
          easedDelta.y * sensitivity,
          rotationEase,
          dt
        );

        // Apply rotation
        flyEuler.y += flyRotationVelocity.x;
        flyEuler.x += flyRotationVelocity.y;

        // Clamp pitch (X axis)
        const maxPitch = Math.PI / 2 - 0.01;
        const minPitch = -maxPitch;
        flyEuler.x = THREE.MathUtils.clamp(flyEuler.x, minPitch, maxPitch);

        // Apply to camera
        camera.quaternion.setFromEuler(flyEuler);

        // Forward direction (camera's -Z axis in world space)
        const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        // Scale by desired distance (or keep original distance from old target)
        const distance = camera.position.distanceTo(targetPosition);
        direction.multiplyScalar(distance);
        // Move Target
        targetPosition.copy(camera.position).add(direction);

        return Math.abs(easedDelta.x) > 0.000000001 && Math.abs(easedDelta.y) > 0.000000001;
      });
    }
  };

  // on mouse wheel change speed or zoom
  const handleMouseWheel = (evt: WheelEvent) => {
    if (mouseButton.current === 2) {
      speed.current -= evt.deltaY * 0.00005 * ratio;
      speed.current = Math.max(0.000001, speed.current);
    } else if (evt.altKey) {
      cancelUpdate();
      if (camera instanceof THREE.OrthographicCamera) {
        camera.zoom += -evt.deltaY * 0.005 * ratio;
        camera.updateProjectionMatrix();
      } else {
        const moveAmount = -evt.deltaY * 0.005 * ratio;
        camera.getWorldDirection(cameraDirection);
        const movement = cameraDirection.clone().multiplyScalar(moveAmount);
        const remainingDistance = camera.position.distanceTo(targetPosition);
        const stopDistance = 1;
        if (moveAmount > 0 && remainingDistance - movement.length() <= stopDistance) {
          return;
        }
        camera.position.add(movement);
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
  const { camera, scene, clock, gl } = useThree();
  const flyCameraRef = useRef<(() => void) | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    cleanupRef.current?.();
    const { flyCamera, cleanup } = setupFlyControls({ camera, renderer: gl, scene });
    flyCameraRef.current = flyCamera;
    cleanupRef.current = cleanup;
  }, [camera, clock, gl, scene]);

  useFrame((_state, _delta) => {
    flyCameraRef.current && flyCameraRef.current();
  });

  useEffect(() => () => cleanupRef.current?.(), []);

  return null;
};

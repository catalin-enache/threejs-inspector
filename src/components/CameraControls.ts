import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, Ref, RefObject, useImperativeHandle } from 'react';
import { getWorldScreenRatio } from 'lib/utils/sizeUtils';
import { useAppStore } from 'src/store';
import patchThree from 'lib/patchThree';

const center = new THREE.Vector3(0, 0, 0);
const clock = new THREE.Clock();

const setupCameraControls = ({
  camera,
  renderer,
  isDisabledRef
}: {
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer;
  isDisabledRef: RefObject<boolean>;
}) => {
  let sceneSize = patchThree.sceneSize;

  let ratio = 0.01;
  const speed = { current: 0.05 * ratio };

  const refreshSceneSize = () => {
    sceneSize = patchThree.sceneSize;
    ratio = sceneSize / 23; // 23 is the scene size the defaults were tested with
    speed.current = 0.05 * ratio;
  };

  refreshSceneSize();

  let moveForward = false;
  let moveBackward = false;
  let moveLeft = false;
  let moveRight = false;
  let moveUp = false;
  let moveDown = false;

  let targetPosition = center.clone();

  const mouseButton = {
    current: null as number | null
  };

  let mouseIsMoving = false;

  const mouseDelta = new THREE.Vector2(0, 0); // Raw input
  const mouseDeltaSmooth = new THREE.Vector2(0, 0); // Raw input smooth
  const easedDelta = new THREE.Vector2(0, 0); // Eased input
  const rotationVelocity = new THREE.Vector2(0, 0);

  const moveDelta = new THREE.Vector3(0, 0, 0);
  const moveDeltaSmooth = new THREE.Vector3(0, 0, 0);
  const easedMove = new THREE.Vector3(0, 0, 0);
  const moveVelocity = new THREE.Vector3(0, 0, 0);

  const controlCameraEnabled = { current: false };
  const euler = new THREE.Euler(0, 0, 0, 'YXZ');
  const cameraDirection = new THREE.Vector3();
  const rightVector = new THREE.Vector3();

  const resetOrbitDeltas = () => {
    mouseDelta.set(0, 0);
    mouseDeltaSmooth.set(0, 0);
    easedDelta.set(0, 0);
    rotationVelocity.set(0, 0);
  };

  const resetMoveDeltas = () => {
    moveDelta.set(0, 0, 0);
    moveDeltaSmooth.set(0, 0, 0);
    easedMove.set(0, 0, 0);
    moveVelocity.set(0, 0, 0);
  };

  const cancelUpdate = () => {
    if (animationFrameId.current) {
      // console.log('cancelAnimationFrame 2');
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;

      resetOrbitDeltas();
      resetMoveDeltas();
    }
  };

  const animationFrameId = {
    current: null as ReturnType<typeof requestAnimationFrame> | null
  };
  const update = (cb: () => boolean) => {
    if (animationFrameId.current) {
      // console.log('cancelAnimationFrame 1');
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

  const updateEuler = ({ dt, minPitch, maxPitch }: { dt: number; minPitch?: number; maxPitch?: number }) => {
    const inputEase = 30; // Increase for snappier input, decrease for smoother
    const rotationEase = 30; // Controls how fast camera turns

    // Easing the raw mouse delta
    // One-frame input injection with smoothed output over time (ease-out)
    mouseDeltaSmooth.x = THREE.MathUtils.damp(mouseDeltaSmooth.x, mouseDelta.x, inputEase, dt);
    mouseDeltaSmooth.y = THREE.MathUtils.damp(mouseDeltaSmooth.y, mouseDelta.y, inputEase, dt);

    easedDelta.x = THREE.MathUtils.damp(easedDelta.x, mouseDeltaSmooth.x, inputEase, dt);
    easedDelta.y = THREE.MathUtils.damp(easedDelta.y, mouseDeltaSmooth.y, inputEase, dt);

    // Decay raw delta after applying it
    mouseDelta.set(0, 0);

    // Apply eased delta to rotation target velocity
    const sensitivity = 0.01;
    rotationVelocity.x = THREE.MathUtils.damp(rotationVelocity.x, easedDelta.x * sensitivity, rotationEase, dt);
    rotationVelocity.y = THREE.MathUtils.damp(rotationVelocity.y, easedDelta.y * sensitivity, rotationEase, dt);

    euler.y += rotationVelocity.x; // horizontal drag
    euler.x += rotationVelocity.y; // vertical drag

    if (minPitch !== undefined && maxPitch !== undefined) {
      euler.x = THREE.MathUtils.clamp(euler.x, minPitch, maxPitch);
    }
  };

  const getSphericalPosition = ({ phi, theta }: { phi?: number; theta?: number } = {}) => {
    const offset = new THREE.Vector3().subVectors(camera.position, targetPosition);
    const spherical = new THREE.Spherical().setFromVector3(offset);
    if (phi !== undefined) {
      spherical.phi = phi;
    }
    if (theta !== undefined) {
      spherical.theta = theta;
    }
    spherical.makeSafe();
    const minPitch = 0.01;
    const maxPitch = Math.PI - 0.01;
    spherical.phi = Math.max(minPitch, Math.min(maxPitch, spherical.phi));
    const position = new THREE.Vector3().setFromSpherical(spherical).add(targetPosition);
    // spherical.radius === camera.position.distanceTo(targetPosition);
    return {
      offset,
      spherical,
      position
    };
  };

  // move camera wasd/qe
  const moveCamera = () => {
    // this will only fire if frameloop is not 'never'
    if (!controlCameraEnabled.current) return;

    const easedMovement = !mouseIsMoving;

    camera.getWorldDirection(cameraDirection); // Get the forward vector
    cameraDirection.normalize();

    rightVector.crossVectors(cameraDirection, camera.up).normalize(); // Get right vector

    if (moveForward) {
      if (camera instanceof THREE.OrthographicCamera) {
        camera.zoom += speed.current;
        camera.updateProjectionMatrix();
      } else {
        if (!easedMovement) {
          camera.position.addScaledVector(cameraDirection, speed.current);
          targetPosition.addScaledVector(cameraDirection, speed.current);
        } else {
          moveDelta.z += speed.current;
        }
      }
    }
    if (moveBackward) {
      if (camera instanceof THREE.OrthographicCamera) {
        camera.zoom -= speed.current;
        camera.updateProjectionMatrix();
      } else {
        if (!easedMovement) {
          camera.position.addScaledVector(cameraDirection, -speed.current);
          targetPosition.addScaledVector(cameraDirection, -speed.current);
        } else {
          moveDelta.z -= speed.current;
        }
      }
    }
    if (moveLeft) {
      if (!easedMovement) {
        camera.position.addScaledVector(rightVector, -speed.current);
        targetPosition.addScaledVector(rightVector, -speed.current);
      } else {
        moveDelta.x -= speed.current;
      }
    }
    if (moveRight) {
      if (!easedMovement) {
        camera.position.addScaledVector(rightVector, speed.current);
        targetPosition.addScaledVector(rightVector, speed.current);
      } else {
        moveDelta.x += speed.current;
      }
    }
    if (moveUp) {
      if (!easedMovement) {
        camera.position.y -= speed.current;
        targetPosition.y -= speed.current;
      } else {
        moveDelta.y -= speed.current;
      }
    }
    if (moveDown) {
      if (!easedMovement) {
        camera.position.y += speed.current;
        targetPosition.y += speed.current;
      } else {
        moveDelta.y += speed.current;
      }
    }

    if (!easedMovement) return;

    if (moveLeft || moveRight || moveUp || moveDown || moveForward || moveBackward) {
      const lambda = 35;
      update(() => {
        const dt = clock.getDelta();

        moveDeltaSmooth.x = THREE.MathUtils.damp(moveDeltaSmooth.x, moveDelta.x, lambda, dt);
        moveDeltaSmooth.y = THREE.MathUtils.damp(moveDeltaSmooth.y, moveDelta.y, lambda, dt);
        moveDeltaSmooth.z = THREE.MathUtils.damp(moveDeltaSmooth.z, moveDelta.z, lambda, dt);
        easedMove.x = THREE.MathUtils.damp(easedMove.x, moveDeltaSmooth.x, lambda, dt);
        easedMove.y = THREE.MathUtils.damp(easedMove.y, moveDeltaSmooth.y, lambda, dt);
        easedMove.z = THREE.MathUtils.damp(easedMove.z, moveDeltaSmooth.z, lambda, dt);
        moveVelocity.x = THREE.MathUtils.damp(moveVelocity.x, easedMove.x, lambda, dt);
        moveVelocity.y = THREE.MathUtils.damp(moveVelocity.y, easedMove.y, lambda, dt);
        moveVelocity.z = THREE.MathUtils.damp(moveVelocity.z, easedMove.z, lambda, dt);

        const moveLeftRightVector = rightVector.clone().multiplyScalar(moveVelocity.x);
        const moveUpDownVector = camera.up.clone().multiplyScalar(moveVelocity.y);
        const moveForwardBackwardVector = cameraDirection.clone().multiplyScalar(moveVelocity.z);
        camera.position.add(moveLeftRightVector);
        targetPosition.add(moveLeftRightVector);
        camera.position.add(moveUpDownVector);
        targetPosition.add(moveUpDownVector);
        camera.position.add(moveForwardBackwardVector);
        targetPosition.add(moveForwardBackwardVector);

        moveDelta.x = 0;
        moveDelta.y = 0;
        moveDelta.z = 0;

        return Math.abs(easedMove.x) > 0.0001 || Math.abs(easedMove.y) > 0.0001 || Math.abs(easedMove.z) > 0.0001;
      });
    }
  };

  const handleKeyDown = (evt: KeyboardEvent) => {
    if (evt.repeat) return;
    mouseIsMoving = false;
    resetMoveDeltas();
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
        cancelUpdate();
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
        const { position } = getSphericalPosition({ phi: 0, theta: 0 });
        camera.position.x = position.x;
        camera.position.y = position.y;
        camera.position.z = position.z;
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
    // optimistic try to enable smooth WASD-QE moving.
    // If mouse is actually moving it will be set to true in the next mouse move handling
    // canceling WASD-QE smooth moving and enabling smooth camera rotation instead.
    mouseIsMoving = false;
    const code = evt.code;
    setTimeout(() => {
      switch (code) {
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
    }, 0);
  };

  const handleMouseDown = (evt: MouseEvent) => {
    controlCameraEnabled.current = evt.target === renderer.domElement;

    if (!controlCameraEnabled.current || isDisabledRef.current) return;

    mouseButton.current = evt.button;
    clock.getDelta();
    refreshSceneSize();
    cancelUpdate();

    const { spherical } = getSphericalPosition();

    if (mouseButton.current === 0) {
      euler.x = spherical.phi; // vertical
      euler.y = spherical.theta; // horizontal
    } else if (mouseButton.current === 2) {
      euler.setFromQuaternion(camera.quaternion);
    }

    if (mouseButton.current === 1 || mouseButton.current === 2) {
      void document.body.requestPointerLock({ unadjustedMovement: true });
    }
  };

  const handleMouseUp = () => {
    controlCameraEnabled.current = false;
    mouseButton.current = null;
    document.exitPointerLock();
  };

  // on mouse move rotate camera
  const handleMouseMove = (evt: MouseEvent) => {
    if (!controlCameraEnabled.current) return;

    mouseIsMoving = true;

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
    // orbit camera around targetPosition
    else if (mouseButton.current === 0) {
      mouseDelta.x -= evt.movementX;
      mouseDelta.y -= evt.movementY;

      update(() => {
        const dt = clock.getDelta();

        const minPitch = 0.01;
        const maxPitch = Math.PI - 0.01;
        updateEuler({ dt, minPitch, maxPitch });

        const { position } = getSphericalPosition({ phi: euler.x, theta: euler.y });

        camera.position.x = position.x;
        camera.position.y = position.y;
        camera.position.z = position.z;
        camera.lookAt(targetPosition);

        return Math.abs(easedDelta.x) > 0.0001 || Math.abs(easedDelta.y) > 0.0001;
      });
    }
    // rotate camera in place
    else if (mouseButton.current === 2) {
      const maxPitch = Math.PI / 2 - 0.01;
      const minPitch = -maxPitch;

      const applyRotation = () => {
        // Apply to camera
        camera.quaternion.setFromEuler(euler);

        // Forward direction (camera's -Z axis in world space)
        const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        // Scale by desired distance (or keep original distance from old target)
        const distance = camera.position.distanceTo(targetPosition);
        direction.multiplyScalar(distance);
        // Move Target
        targetPosition.copy(camera.position).add(direction);
      };

      mouseDelta.x -= evt.movementX;
      mouseDelta.y -= evt.movementY;

      update(() => {
        const dt = clock.getDelta();

        updateEuler({ dt, minPitch, maxPitch });

        applyRotation();

        return Math.abs(easedDelta.x) > 0.0001 || Math.abs(easedDelta.y) > 0.0001;
      });
    }
  };

  // on mouse wheel change speed or zoom
  const handleMouseWheel = (evt: WheelEvent) => {
    if (mouseButton.current === 2) {
      speed.current -= evt.deltaY * 0.0001 * ratio;
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
    moveCamera,
    cleanup
  };
};

// TODO: improve this to control when frameloop is 'demand'
export type CameraControlsRefType = { setIsDisabled: (isDisabled: boolean) => void };
export interface CameraControlsProps {
  ref: Ref<CameraControlsRefType>;
}

export const CameraControls = ({ ref }: CameraControlsProps) => {
  const { camera, clock, gl } = useThree();
  const moveCameraRef = useRef<(() => void) | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const isDisabledRef = useRef(false);

  useImperativeHandle(
    ref,
    () => ({
      setIsDisabled: (isDisabled: boolean) => {
        isDisabledRef.current = isDisabled;
      }
    }),
    []
  );

  useEffect(() => {
    cleanupRef.current?.();
    const { moveCamera, cleanup } = setupCameraControls({ camera, renderer: gl, isDisabledRef });
    moveCameraRef.current = moveCamera;
    cleanupRef.current = cleanup;
  }, [camera, clock, gl]);

  useFrame((_state, _delta) => {
    moveCameraRef.current && moveCameraRef.current();
  });

  useEffect(() => () => cleanupRef.current?.(), []);

  return null;
};

import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { getSceneBoundingBoxSize } from 'lib/utils/sizeUtils';

const setupFlyControls = (camera: THREE.Camera, scene: THREE.Scene) => {
  let moveForward = false;
  let moveBackward = false;
  let moveLeft = false;
  let moveRight = false;
  let moveUp = false;
  let moveDown = false;

  const sceneBoundingBox = getSceneBoundingBoxSize(scene, camera);
  const sceneSize = Math.max(sceneBoundingBox.x, sceneBoundingBox.y, sceneBoundingBox.z);
  const ratio = sceneSize / 23; // 23 is the scene size the defaults were tested with

  const flyCameraEnabled = { current: false };
  const speed = { current: 0.05 * ratio };
  const euler = new THREE.Euler(0, 0, 0, 'YXZ');
  const cameraDirection = new THREE.Vector3();
  const rightVector = new THREE.Vector3();

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

  // on right mouse down, enable Fly camera and on right mouse up, disable Fly camera
  const handleMouseDown = (evt: MouseEvent) => {
    if (evt.button === 2) {
      flyCameraEnabled.current = true;
      document.body.requestPointerLock();
    }
  };

  const handleMouseUp = (evt: MouseEvent) => {
    if (evt.button === 2) {
      flyCameraEnabled.current = false;
      document.exitPointerLock();
    }
  };

  // on mouse move rotate camera
  const handleMouseMove = (evt: MouseEvent) => {
    if (!flyCameraEnabled.current) return;
    const sensitivity = 0.003;
    euler.setFromQuaternion(camera.quaternion);
    euler.y -= evt.movementX * sensitivity;
    euler.x -= evt.movementY * sensitivity;
    euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));
    camera.quaternion.setFromEuler(euler);
  };

  // on mouse wheel change speed
  const handleMouseWheel = (evt: WheelEvent) => {
    speed.current -= evt.deltaY * 0.00005 * ratio;
    speed.current = Math.max(0.000001, speed.current);
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

export const FlyControls = () => {
  const { camera, scene } = useThree();
  const flyCameraRef = useRef<(() => void) | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    cleanupRef.current?.();
    const { flyCamera, cleanup } = setupFlyControls(camera, scene);
    flyCameraRef.current = flyCamera;
    cleanupRef.current = cleanup;
  }, [camera]);

  useFrame((_state, _delta) => {
    flyCameraRef.current && flyCameraRef.current();
  });

  useEffect(() => () => cleanupRef.current?.(), []);

  return null;
};

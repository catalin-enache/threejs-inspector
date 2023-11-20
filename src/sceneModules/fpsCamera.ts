import * as THREE from 'three';

export const setupFPSCamera = ({
  getCamera,
  getOrbitControls
}: {
  getCamera: () => THREE.Camera;
  getOrbitControls: () => any;
}) => {
  let moveForward = false;
  let moveBackward = false;
  let moveLeft = false;
  let moveRight = false;
  let moveUp = false;
  let moveDown = false;

  const fpsCameraEnabled = { current: false };
  const speed = { current: 0.05 };
  const euler = new THREE.Euler(0, 0, 0, 'YXZ');

  // move camera wasd/qe
  const fpsCamera = () => {
    if (!fpsCameraEnabled.current) return;
    const camera = getCamera();
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection); // Get the forward vector
    cameraDirection.normalize();

    const rightVector = new THREE.Vector3();
    rightVector.crossVectors(cameraDirection, camera.up).normalize(); // Get right vector

    if (moveForward) {
      if (camera instanceof THREE.OrthographicCamera) {
        camera.zoom += speed.current / 4; // not zooming even if Zoom is changed
        camera.updateProjectionMatrix();
      } else {
        camera.position.addScaledVector(cameraDirection, speed.current);
      }
    }
    if (moveBackward) {
      if (camera instanceof THREE.OrthographicCamera) {
        camera.zoom -= speed.current / 4; // not zooming even if Zoom is changed
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

  window.addEventListener('keydown', (evt: KeyboardEvent) => {
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE'].includes(evt.code)) {
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
    }
  });

  window.addEventListener('keyup', (evt: KeyboardEvent) => {
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
  });

  // on right mouse down, enable FPS camera and on right mouse up, disable FPS camera
  window.addEventListener('mousedown', (evt: MouseEvent) => {
    if (getOrbitControls().enabled) return;
    if (evt.button === 2) {
      fpsCameraEnabled.current = true;
    }
  });

  window.addEventListener('mouseup', (evt: MouseEvent) => {
    if (evt.button === 2) {
      fpsCameraEnabled.current = false;
    }
  });

  // on mouse move rotate camera
  window.addEventListener('mousemove', (evt: MouseEvent) => {
    if (!fpsCameraEnabled.current) return;
    const camera = getCamera();
    const sensitivity = 0.003;
    euler.setFromQuaternion(camera.quaternion);
    euler.y -= evt.movementX * sensitivity;
    euler.x -= evt.movementY * sensitivity;
    euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));
    camera.quaternion.setFromEuler(euler);
  });

  // on mouse wheel change speed
  window.addEventListener('wheel', (evt: WheelEvent) => {
    if (getOrbitControls().enabled) return;
    speed.current -= evt.deltaY * 0.00005;
    speed.current = Math.max(0.000001, speed.current);
  });

  return {
    fpsCamera
  };
};

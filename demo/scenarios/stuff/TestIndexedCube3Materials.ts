import * as THREE from 'three';

export const TestIndexedCube3Materials = () => {
  const geometry = new THREE.BufferGeometry();

  // prettier-ignore
  const vertices = new Float32Array([
    -1.0, -1.0,  1.0,  // 0
    1.0, -1.0,  1.0,  // 1
    1.0,  1.0,  1.0,  // 2
    -1.0,  1.0,  1.0,  // 3
    -1.0, -1.0, -1.0,  // 4
    1.0, -1.0, -1.0,  // 5
    1.0,  1.0, -1.0,  // 6
    -1.0,  1.0, -1.0   // 7
  ]);

  // Add the vertices to the geometry
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  // prettier-ignore
  const indices = new Uint16Array([
    0, 1, 2, 2, 3, 0,  // Front face
    1, 5, 6, 6, 2, 1,  // Right face
    4, 0, 3, 3, 7, 4,  // Left face
    4, 5, 1, 1, 0, 4,  // Bottom face
    3, 2, 6, 6, 7, 3,  // Top face
    5, 4, 7, 7, 6, 5   // Back face
  ]);

  // Set the index buffer for the geometry
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));

  const materials = [
    new THREE.MeshBasicMaterial({ color: 0xff0000 }), // Red
    new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // Green
    new THREE.MeshBasicMaterial({ color: 0x0000ff }) // Blue
  ];

  // Assign groups to different materials
  geometry.addGroup(0, 6, 0);
  geometry.addGroup(6, 6, 1);
  geometry.addGroup(12, 6, 2);
  geometry.addGroup(18, 6, 0);
  geometry.addGroup(24, 6, 1);
  geometry.addGroup(30, 6, 2);

  const cube = new THREE.Mesh(geometry, materials);
  cube.name = 'IndexedCube3Materials';

  const group = new THREE.Group();
  group.__inspectorData.isInspectable = true;
  group.name = 'IndexedCube3Materials group';
  group.add(cube);
  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.name = 'IndexedCube3Materials pointLight';
  cube.add(pointLight);
  return group;
};

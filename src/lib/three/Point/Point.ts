import * as THREE from 'three';
export class Point extends THREE.Points {
  constructor(color: number = 0xffffff, size: number = 5) {
    const vertices = [];
    vertices.push(0, 0, 0);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    const material = new THREE.PointsMaterial({ color, size });
    super(geometry, material);
  }
}

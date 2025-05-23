import * as THREE from 'three';
import { UnpackDepthRGBAShader } from 'three/examples/jsm/shaders/UnpackDepthRGBAShader';

// use : thumbnailMaterial.uniforms.map.value = texture; then render the mesh
export const getThumbnailMaterial = () => {
  return new THREE.ShaderMaterial({
    uniforms: {
      map: { value: null }
    },
    vertexShader: `
        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D map;
        varying vec2 vUv;

        void main() {
            gl_FragColor = texture2D(map, vUv);
        }
    `
  });
};

// use : shadowMapMaterial.uniforms.tDiffuse.value = texture; then render the mesh
// From Three ShadowMapViewer example
export const getShadowMapMaterial = () => {
  const shader = UnpackDepthRGBAShader;
  return new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.clone(shader.uniforms),
    vertexShader: shader.vertexShader,
    fragmentShader: shader.fragmentShader
  });
};

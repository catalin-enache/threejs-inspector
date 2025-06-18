
uniform vec2 uResolution;

varying vec2 vUv;
varying vec2 vResolution;

void main() {
     gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
     vUv = uv;
     vResolution = uResolution;
}

#include /node_modules/lygia/sample/normalFromHeightMap


uniform sampler2D uHeightMap;
uniform float uIntensity;
uniform float uOffset;

varying vec2 vUv;

void main() {
    vec4 textureColor = texture2D(uHeightMap, vUv);
    /*
    normalFromHeightMap(
      sampler2D heightMap,  // your height texture
      vec2 st,              // UV coords
      float strength,       // how strong is the normal effect
      float offset          // small bias if needed
    )
    */
    vec3 normal = normalFromHeightMap(uHeightMap, vUv, uIntensity, uOffset);
    normal = normal * 0.5 + 0.5; // from [-1, 1] to [0, 1]
    gl_FragColor = vec4(normal, 1.0);
}

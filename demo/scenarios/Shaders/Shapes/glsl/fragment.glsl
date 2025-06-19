#include /src/glsl/math
#include /src/glsl/uv
#include /src/glsl/noise
#include /src/glsl/shapes


uniform int uShape;
uniform vec4 uVars;

varying vec2 vUv;


void main() {
    if (uShape == 1) {
        vec2 st = vUv;
        float y = (sin(st.x * 10.0) + 1.0) / 2.0;
        float pct = plot(st, y);
        vec3 color = vec3(y);
        color = (1.0 - pct) * color + pct * vec3(0.0, 1.0, 0.0);
        gl_FragColor = vec4(color, 1.0);
    } else {
        vec2 st = vUv;
        gl_FragColor = vec4(st, 0.0, 1.0);
    }

}

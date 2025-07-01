#include /src/glsl/math
#include /src/glsl/bezier
#include /src/glsl/uv
#include /src/glsl/noise
#include /src/glsl/shapes


uniform int uShape;
uniform vec4 uVars;

varying vec2 vUv;


void main() {
    vec2 st = vUv;
    float y = st.x;
    if (uShape == 1) {
        y = (sin(st.x * (1.0 - uVars.x) * 20.0) + 1.0) / 2.0 * (1.0 - uVars.y);
    } else if (uShape == 2) {
        y = pow(st.x, (1.0 - uVars.x) * 5.0);
    } else if (uShape == 3) {
        float x = st.x + uVars.x;
        y = smoothstep(0.2 + uVars.y, 0.5 - uVars.y, x) - smoothstep(0.5 + uVars.y, 0.8 - uVars.y, x);
    } else if (uShape == 4) {
        y = mod(st.x / (1.0 - uVars.z) - uVars.y, 0.1 + uVars.x);
    } else if (uShape == 5) {
        y = ceil(st.x * (1.0 - uVars.x) * 10.0) / 10.0;
    } else if (uShape == 6) {
        y = sign((st.x - uVars.x) * 2.0 - 1.0) * (1.0 - uVars.y);
    } else if (uShape == 7) {
        y = abs((st.x - uVars.x) * 2.0 - 1.0) * (1.0 - uVars.y);
    } else if (uShape == 8 || uShape == 9 || uShape == 10 || uShape == 11) {
        st -= 0.5;
        st *= 2.0; // remap to [-1, 1] range
        float xRange = uVars.x * 2.0 - 1.0;
        float yRange = uVars.y * 2.0 - 1.0;
        float zRange = uVars.z * 2.0 - 1.0;
        float wRange = uVars.w * 2.0 - 1.0;

        vec2 a = vec2(xRange, yRange);
        vec2 b = vec2(zRange, wRange);

        vec3 color = vec3(0.0);
        float h = 0.0;

        vec2 pa = st - a, ba = b - a;
        // h = dot(pa, ba) / dot(ba, ba); // without clamping the projection goes along the entire line,
        // with clamping the projection is limited to the segment ba
        h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); // percentage (ratio) along the segment, where pa projects on segment ba (0..1)
//        h = fract(clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0 )); // for interesting gradient effects if this is used as color
        vec2 projection = ba * h; // a + ba * h is the point on the segment ba closest to pa
        vec2 segmentTo_pa = pa - projection; // === | pa - ba * h | (st - a) - ba * h | st - a - ba * h | st - (a + ba * h)
        float distanceToTheSegment = length(segmentTo_pa);
        float line = smoothstep(0.0, 0.001, distanceToTheSegment);
        if (uShape == 8) {
            color = vec3(fract(h));
        } else if (uShape == 9) {
            color = vec3(abs(segmentTo_pa), 0.0);
        } else if (uShape == 10) {
            color = vec3(distanceToTheSegment);
        } else if (uShape == 11) {
            color = vec3(line);
        } else {
            color = vec3(0.0); // default case
        }

        color = mix(vec3(1.0, 0.0, 0.0), color, smoothstep(0.01, 0.02, distance(a, st))); // point a
        color = mix(vec3(0.0, 1.0, 0.0), color, smoothstep(0.01, 0.02, distance(b, st))); // point b
//        color = mix(vec3(1), color, tifmk_lineSegment(st, cp0, cp1));
        gl_FragColor = vec4(color, 1.0);
        st = st * 0.5 + 0.5; // remap to [0, 1] range
        return;
    } else if (uShape == 12) {
        float ax = uVars.x;
        float ay = uVars.y;
        float bx = uVars.z;
        float by = uVars.w;

        vec2 a = vec2(ax, ay);
        vec2 b = vec2(bx, by);

        float l = tifmk_cubicBezier(st.x, a, b);
        vec3 color = vec3(smoothstep(l, l+0.001, st.y));

        color = mix(vec3(0.5), color, tifmk_lineSegment(st, vec2(0.0), a));
        color = mix(vec3(0.5), color, tifmk_lineSegment(st, vec2(1.0), b));
        color = mix(vec3(0.5), color, tifmk_lineSegment(st, a, b));
        color = mix(vec3(1.0,0.0,0.0), color, smoothstep(0.01,0.011,distance(a, st)));
        color = mix(vec3(1.0,0.0,0.0), color, smoothstep(0.01,0.011,distance(b, st)));

        gl_FragColor = vec4(color, 1.0);

        return;
    } else if (uShape == 13) {
        vec3 color = vec3(0.0);

        vec2 size = vec2(0.2, 0.2);
        float r = tifmk_rectangle(st, size);
//        float r = tifmk_roundedRectangle(st);
        color = vec3(r);
        gl_FragColor = vec4(color, 1.0);
        return;
    } else if (uShape == 14) {
        vec3 color = vec3(0.0);
        float f = tifmk_flower(st, int(uVars[0] * 10.0));
        color = vec3(f);
        gl_FragColor = vec4(color, 1.0);
        return;
    } else if (uShape == 15) {
        vec3 color = vec3(0.0);
        float f = tifmk_polygon(st, int(uVars[0] * 10.0));
        color = vec3(f);
        gl_FragColor = vec4(color, 1.0);
        return;
    } else {
        st = st * 2.0 - 1.0; // remap to [-1, 1] range
        vec3 color = vec3(length(max(abs(st)-.5, 0.0)));
        gl_FragColor = vec4(color, 1.0);
        st = st * 0.5 + 0.5; // remap to [0, 1] range
        return;
    }

    float pct = tifmk_plot(st, y);
    vec3 color = vec3(y);
    color = (1.0 - pct) * color + pct * vec3(0.0, 1.0, 0.0);
    gl_FragColor = vec4(color, 1.0);
}

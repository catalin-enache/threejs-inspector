#ifndef TIFMK_RANDOM_SCALE
#define TIFMK_RANDOM_SCALE vec4(443.897, 441.423, 0.0973, 0.1099)
#endif

#ifndef TIFMK_RANDOM_GLSL
#define TIFMK_RANDOM_GLSL

float tifmk_random (in float x) {
    return fract(sin(x) * 1e4);
}

// https://thebookofshaders.com/10/
float tifmk_random(in vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

vec2 tifmk_random2(vec2 st){
    st = vec2( dot(st, vec2(127.1, 311.7)), dot(st, vec2(269.5, 183.3)) );
    return fract(sin(st) * 43758.5453123);
}

vec3 tifmk_random3(vec3 p) {
    p = fract(p * TIFMK_RANDOM_SCALE.xyz);
    p += dot(p, p.yxz + 19.19);
    return fract((p.xxy + p.yzz) * p.zyx);
}

vec3 tifmk_random3( vec2 p ) {
    vec3 q = vec3( dot(p,vec2(127.1,311.7)),
    dot(p,vec2(269.5,183.3)),
    dot(p,vec2(419.2,371.9)) );
    return fract(sin(q)*43758.5453);
}

#endif

#ifndef PI
#define PI 3.1415926535897932384626433832795
#endif

#ifndef TIFMK_MATH_GLSL
#define TIFMK_MATH_GLSL



float _modulo(float a, float b) {
    // https://docs.gl/el3/mod
    // native mod implementation
    return a - floor(a / b) * b;
}

float _random (in float x) {
    return fract(sin(x)*1e4);
}

// https://thebookofshaders.com/10/
float _random(in vec2 st)
{
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

vec2 _rotate2D(vec2 st, float rotation, vec2 mid) {
    // Rotate st around mid by rotation radians
    st -= mid; // move to origin
    float s = sin(rotation);
    float c = cos(rotation);
    st = vec2(st.x * c - st.y * s, st.x * s + st.y * c); // rotate
    st += mid; // move back
    return st;
}

#endif

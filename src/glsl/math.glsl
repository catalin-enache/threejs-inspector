#ifndef PI
#define PI 3.1415926535897932384626433832795
#endif

#ifndef TWO_PI
#define TWO_PI 6.28318530718
#endif

#ifndef TIFMK_MATH_GLSL
#define TIFMK_MATH_GLSL



float _modulo(float a, float b) {
    // https://docs.gl/el3/mod
    // native mod implementation
    return a - floor(a / b) * b;
}

float _random (in float x) {
    return fract(sin(x) * 1e4);
}

// https://thebookofshaders.com/10/
float _random(in vec2 st)
{
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

vec2 _random2(vec2 st){
    st = vec2( dot(st, vec2(127.1, 311.7)), dot(st, vec2(269.5, 183.3)) );
    return -1.0 + 2.0 * fract(sin(st) * 43758.5453123);
}



#endif

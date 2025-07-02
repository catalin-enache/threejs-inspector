#ifndef PI
#define PI 3.1415926535897932384626433832795
#endif

#ifndef TWO_PI
#define TWO_PI 6.28318530718
#endif

#ifndef TIFMK_MATH_GLSL
#define TIFMK_MATH_GLSL



float tifmk_modulo(float a, float b) {
    // https://docs.gl/el3/mod
    // native mod implementation
    return a - floor(a / b) * b;
}


#endif

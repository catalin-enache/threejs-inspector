
#ifndef TIFMK_COLOR_GLSL
#define TIFMK_COLOR_GLSL

// https://iquilezles.org/articles/palettes/
// https://www.youtube.com/shorts/TH3OTy5fTog

vec3 tifmk_palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d ) {
    return a + b * cos( 6.283185 * (c * t + d) );
}

#endif

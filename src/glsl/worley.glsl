#include /src/glsl/random

#ifndef TIFMK_WORLEY_JITTER
#define TIFMK_WORLEY_JITTER 1.0
#endif

#ifndef TIFMK_WORLEY_GLSL
#define TIFMK_WORLEY_GLSL

vec2 tifmk_worley2(vec2 p){
    vec2 n = floor( p );
    vec2 f = fract( p );

    float distF1 = 1.0;
    float distF2 = 1.0;
    vec2 off1 = vec2(0.0);
    vec2 pos1 = vec2(0.0);
    vec2 off2 = vec2(0.0);
    vec2 pos2 = vec2(0.0);
    for( int j= -1; j <= 1; j++ ) {
        for( int i=-1; i <= 1; i++ ) {
            vec2  g = vec2(i,j);
            vec2  o = tifmk_random2( n + g ) * TIFMK_WORLEY_JITTER;
            vec2  p = g + o;
            float d = distance(p, f);
            if (d < distF1) {
                distF2 = distF1;
                distF1 = d;
                off2 = off1;
                off1 = g;
                pos2 = pos1;
                pos1 = p;
            }
            else if (d < distF2) {
                distF2 = d;
                off2 = g;
                pos2 = p;
            }
        }
    }

    return vec2(distF1, distF2);
}

vec2 tifmk_worley2(vec3 p) {
    vec3 n = floor( p );
    vec3 f = fract( p );

    float distF1 = 1.0;
    float distF2 = 1.0;
    vec3 off1 = vec3(0.0);
    vec3 pos1 = vec3(0.0);
    vec3 off2 = vec3(0.0);
    vec3 pos2 = vec3(0.0);
    for( int k = -1; k <= 1; k++ ) {
        for( int j= -1; j <= 1; j++ ) {
            for( int i=-1; i <= 1; i++ ) {
                vec3  g = vec3(i,j,k);
                vec3  o = tifmk_random3( n + g ) * TIFMK_WORLEY_JITTER;
                vec3  p = g + o;
                float d = distance(p, f);
                if (d < distF1) {
                    distF2 = distF1;
                    distF1 = d;
                    off2 = off1;
                    off1 = g;
                    pos2 = pos1;
                    pos1 = p;
                }
                else if (d < distF2) {
                    distF2 = d;
                    off2 = g;
                    pos2 = p;
                }
            }
        }
    }

    return vec2(distF1, distF2);
}

#endif

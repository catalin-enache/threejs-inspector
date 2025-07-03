#include /src/glsl/random

#ifndef TIFMK_IQ_NOISE_GLSL
#define TIFMK_IQ_NOISE_GLSL


// https://thebookofshaders.com/12/
// https://thebookofshaders.com/edit.php#12/2d-voronoise.frag
// http://www.iquilezles.org/www/articles/voronoise/voronoise.htm
float tifmk_iqnoise( in vec2 x, float u, float v ) {
    vec2 p = floor(x);
    vec2 f = fract(x);

    float k = 1.0+63.0*pow(1.0-v,4.0);

    float va = 0.0;
    float wt = 0.0;
    for (int j=-2; j<=2; j++) {
        for (int i=-2; i<=2; i++) {
            vec2 g = vec2(float(i),float(j));
            vec3 o = tifmk_random3(p + g)*vec3(u,u,1.0);
            vec2 r = g - f + o.xy;
            float d = dot(r,r);
            float ww = pow( 1.0-smoothstep(0.0,1.414,sqrt(d)), k );
            va += o.z*ww;
            wt += ww;
        }
    }

    return va/wt;
}

#endif

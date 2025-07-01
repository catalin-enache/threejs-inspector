#ifndef TIFMK_MATH_GLSL
#define TIFMK_MATH_GLSL

/*
// https://thebookofshaders.com/11/
// Cubic Hermite Curve.  Same as SmoothStep()
y = x*x*(3.0-2.0*x);
// Quintic interpolation curve
y = x*x*x*(x*(x*6.-15.)+10.);
*/

float tifmk_cubic(const in float v) { return v*v*(3.0-2.0*v); }
vec2  tifmk_cubic(const in vec2 v)  { return v*v*(3.0-2.0*v); }
vec3  tifmk_cubic(const in vec3 v)  { return v*v*(3.0-2.0*v); }
vec4  tifmk_cubic(const in vec4 v)  { return v*v*(3.0-2.0*v); }

float tifmk_quintic(const in float v) { return v*v*v*(v*(v*6.0-15.0)+10.0); }
vec2  tifmk_quintic(const in vec2 v)  { return v*v*v*(v*(v*6.0-15.0)+10.0); }
vec3  tifmk_quintic(const in vec3 v)  { return v*v*v*(v*(v*6.0-15.0)+10.0); }
vec4  tifmk_quintic(const in vec4 v)  { return v*v*v*(v*(v*6.0-15.0)+10.0); }

float tifmk_smootherstep(float e1, float e2, const in float v) {
    float t = clamp((v - e1) / (e2 - e1), 0.0, 1.0);
    return tifmk_quintic(t);
}
vec2 smootherstep(vec2 e1, vec2 e2, const in vec2 v) {
    vec2 t = clamp((v - e1) / (e2 - e1), 0.0, 1.0);
    return tifmk_quintic(t);
}
vec3 tifmk_smootherstep(vec3 e1, vec3 e2, const in vec3 v) {
    vec3 t = clamp((v - e1) / (e2 - e1), 0.0, 1.0);
    return tifmk_quintic(t);
}
vec4 tifmk_smootherstep(vec4 e1, vec4 e2, const in vec4 v) {
    vec4 t = clamp((v - e1) / (e2 - e1), 0.0, 1.0);
    return tifmk_quintic(t);
}

#endif

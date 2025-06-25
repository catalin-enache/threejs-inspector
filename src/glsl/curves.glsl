#ifndef TIFMK_MATH_GLSL
#define TIFMK_MATH_GLSL

/*
// https://thebookofshaders.com/11/
// Cubic Hermite Curve.  Same as SmoothStep()
y = x*x*(3.0-2.0*x);
// Quintic interpolation curve
y = x*x*x*(x*(x*6.-15.)+10.);
*/

float cubic(const in float v) { return v*v*(3.0-2.0*v); }
vec2  cubic(const in vec2 v)  { return v*v*(3.0-2.0*v); }
vec3  cubic(const in vec3 v)  { return v*v*(3.0-2.0*v); }
vec4  cubic(const in vec4 v)  { return v*v*(3.0-2.0*v); }

float quintic(const in float v) { return v*v*v*(v*(v*6.0-15.0)+10.0); }
vec2  quintic(const in vec2 v)  { return v*v*v*(v*(v*6.0-15.0)+10.0); }
vec3  quintic(const in vec3 v)  { return v*v*v*(v*(v*6.0-15.0)+10.0); }
vec4  quintic(const in vec4 v)  { return v*v*v*(v*(v*6.0-15.0)+10.0); }


#endif

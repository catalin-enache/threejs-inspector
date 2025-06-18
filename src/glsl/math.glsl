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
    return fract(sin(x) * 1e4);
}

// https://thebookofshaders.com/10/
float _random(in vec2 st)
{
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

mat2 _getRotate2dMat(float angle){
    float c = cos(angle);
    float s = sin(angle);
    /*
    glsl is colummn major, so the matrix is defined as:
    */
    return mat2(c, s, -s, c);
    /*
    so mathematically it is:
    [c, -s]
    [s,  c]
    */

}

mat2 _getScale2dMat(vec2 scale){
    return mat2(scale.x, 0.0, 0.0, scale.y);
}

vec2 _rotate2D(vec2 st, float rotation, vec2 center) {
    // Rotate st around center by rotation radians
    st -= center; // make center the origin
    /*
    // https://en.wikipedia.org/wiki/Rotation_matrix
    [c, -s] * [x]
    [s,  c] * [y]
    */
    // float s = sin(rotation);
    // float c = cos(rotation);
    // st = vec2(c * st.x + -s * st.y, s * st.x + c * st.y);
    mat2 rot = _getRotate2dMat(rotation);
    st = rot * st;
    // same as:
    // st = vec2(rot[0][0] * st.x  + rot[1][0] * st.y, rot[0][1] * st.x  + rot[1][1] * st.y);
    // st = vec2(rot[0].x * st.x  + rot[1].x * st.y, rot[0].y * st.x  + rot[1].y * st.y);
    st += center; // move back to 0,0
    return st;
}

#endif

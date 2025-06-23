#ifndef TIFMK_TRANSFORMATIONS_GLSL
#define TIFMK_TRANSFORMATIONS_GLSL


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

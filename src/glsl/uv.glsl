#ifndef TIFMK_UV_GLSL
#define TIFMK_UV_GLSL


float selectGridCell(vec2 ipos, float row, float col) {
    float rowMatch = 1.0 - step(0.5, abs(ipos.y - row));
    float colMatch = 1.0 - step(0.5, abs(ipos.x - col));
    return colMatch * rowMatch;
    /*
    abs(ipos.x - col) is zero only when you're in column
    step(0.5, 0.0) = 0, so 1.0 - 0 = 1.0
    If not equal → abs() is ≥ 1.0 (e.g. 2.0 | 3.0 | ...), and step(0.5, 1.0) = 1.0 → 1.0 - 1.0 = 0.0
    ✅ So match == 1.0 only when you're in (col, row).
    */
}

vec2 truchetPattern(in vec2 st, in float index){
    index = fract(((index - 0.5) * 2.0));
    if (index > 0.75) {
        st = vec2(1.0) - st; // Flip Both eq to 180° rotation
    } else if (index > 0.5) {
        st = vec2(1.0 - st.x, st.y); // Flip X
        //st = vec2(st.y, 1.0 - st.x); // Rotate +-90°
    } else if (index > 0.25) {
        //st = vec2(st.x, 1.0 - st.y); // Flip Y
        st = vec2(1.0 - st.y, st.x); // Rotate +-90°
    }
    return st;
}

#endif

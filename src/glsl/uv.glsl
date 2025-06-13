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

#endif

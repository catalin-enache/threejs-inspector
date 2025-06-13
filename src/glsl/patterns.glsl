#ifndef TIFMK_PATTERNS_GLSL
#define TIFMK_PATTERNS_GLSL
vec2 truchetPattern(in vec2 _st, in float _index){
    _index = fract(((_index - 0.5) * 2.0));
    if (_index > 0.75) {
        _st = vec2(1.0) - _st; // Flip Both eq to 180° rotation
    } else if (_index > 0.5) {
        _st = vec2(1.0 - _st.x, _st.y); // Flip X
        //_st = vec2(_st.y, 1.0 - _st.x); // Rotate +-90°
    } else if (_index > 0.25) {
        //_st = vec2(_st.x, 1.0 - _st.y); // Flip Y
        _st = vec2(1.0 - _st.y, _st.x); // Rotate +-90°
    }
    return _st;
}
#endif

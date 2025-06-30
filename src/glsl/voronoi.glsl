#ifndef TIFMK_VORONOI_GLSL
#define TIFMK_VORONOI_GLSL

struct VoronoiResult {
    vec2 point; // closest point
    float dist; // distance to closest point
};

// worley
VoronoiResult voronoi(vec2 st, float uTime) {
    vec2 i_st = floor(st);
    vec2 f_st = fract(st);
    float m_dist = 1.;
    vec2 m_point = vec2(0.0);

    for (int x = -1; x <= 1; x++) {
        for (int y = -1; y <= 1; y++) {
            vec2 neighbor = vec2(float(x), float(y));
            vec2 point = random2(i_st + neighbor) / 2.0 + 0.5;
            // animate point
            if (uTime > 0.0) {
                point = sin(uTime + point * TWO_PI) / 2.0 + 0.5;
            }
            // point += sin(uTime + point * TWO_PI); // departs too much from the cell, -1..1
            vec2 diff = neighbor + point - f_st; // (i_st + neighbor + point) - (i_st + f_st);
            float dist = length(diff);
            if (dist < m_dist) {
                m_dist = dist;
                m_point = point;
            }
        }
    }

    VoronoiResult result;
    result.point = m_point;
    result.dist = m_dist;
    return result;
}

VoronoiResult voronoi(vec2 st) {
    return voronoi(st, 0.0); // default uTime to 0.0
}

#endif

#include /src/glsl/random

#ifndef TIFMK_VORONOI_GLSL
#define TIFMK_VORONOI_GLSL

struct VoronoiResult {
    vec2 point; // closest point
    float dist; // distance to closest point
};

// https://thebookofshaders.com/edit.php#12/vorono-01.frag
// https://iquilezles.org/articles/smoothvoronoi/
VoronoiResult tifmk_voronoi(vec2 st, float uTime) {
    vec2 i_st = floor(st);
    vec2 f_st = fract(st);
    float m_dist = 8.; // // should be 8 for dist = dot(diff, diff) and sqrt(8) for dist = length(diff)
    vec2 m_point = vec2(0.0);
    vec2 m_diff;

    for (int x = -1; x <= 1; x++) {
        for (int y = -1; y <= 1; y++) {
            vec2 neighbor = vec2(float(x), float(y));
            vec2 point = tifmk_random2(i_st + neighbor);
            // animate point
            point = sin(uTime + point * TWO_PI) / 2.0 + 0.5;
            // point += sin(uTime + point * TWO_PI); // departs too much from the cell, -1..1
            vec2 diff = neighbor + point - f_st; // (i_st + neighbor + point) - (i_st + f_st);
            // float dist = length(diff);
            float dist = dot(diff, diff); // squared distance, avoids sqrt for performance
            if (dist < m_dist) {
                m_dist = dist;
                m_point = point;
                m_diff = diff;
            }
        }
    }

    m_dist = sqrt(m_dist); // convert back to distance

    VoronoiResult result;
    result.point = m_point;
    result.dist = m_dist;
    return result;
}

// https://thebookofshaders.com/edit.php#12/metaballs.frag
VoronoiResult tifmk_voronoi_metaball(vec2 st, float uTime) {
    vec2 i_st = floor(st);
    vec2 f_st = fract(st);
    float m_dist = 1.; // should be 8 for dist = dot(diff, diff) and sqrt(8) for dist = length(diff)
    vec2 m_point = vec2(0.0);

    for (int x = -1; x <= 1; x++) {
        for (int y = -1; y <= 1; y++) {
            vec2 neighbor = vec2(float(x), float(y));
            vec2 point = tifmk_random2(i_st + neighbor);
            // animate point
            point = sin(uTime + point * TWO_PI) / 2.0 + 0.5;
            vec2 diff = neighbor + point - f_st;
            float dist = length(diff);
            // metaball it !
            // 1 / dist² is a classic, mathematical field function used for metaballs
            // dist * m_dist is an aproximation
            // Small dist → shrinks m_dist more
            // Large dist → has weaker influence
            if (dist * m_dist < m_dist) {
                m_dist = dist * m_dist;
                m_point = point;
            }
        }
    }

    VoronoiResult result;
    result.point = m_point;
    result.dist = m_dist;
    return result;
}

// https://iquilezles.org/articles/voronoilines/
// https://thebookofshaders.com/edit.php#12/2d-voronoi.frag
VoronoiResult tifmk_voronoi_borders(vec2 st, float uTime) {
    vec2 i_st = floor(st);
    vec2 f_st = fract(st);

    vec2 m_point = vec2(0.0);
    vec2 m_neighbour = vec2(0.0);
    vec2 m_diff = vec2(0.0);

    float m_dist = 8.;

    for (int x = -1; x <= 1; x++) {
        for (int y = -1; y <= 1; y++) {
            vec2 neighbor = vec2(float(x), float(y));
            vec2 point = tifmk_random2(i_st + neighbor);
            // animate point
            point = sin(uTime + point * TWO_PI) / 2.0 + 0.5;
            vec2 diff = neighbor + point - f_st;
            float dist = length(diff);
            if (dist < m_dist) {
                m_dist = dist;
                m_neighbour = neighbor;
                m_diff = diff;
            }
        }
    }

    m_dist = 8.;
    // second pass to find the closest point on the border
    for (int x = -2; x <= 2; x++) {
        for (int y = -2; y <= 2; y++) {
            vec2 neighbor = m_neighbour + vec2(float(x), float(y));
            vec2 point = tifmk_random2(i_st + neighbor);
            // animate point
            point = sin(uTime + point * TWO_PI) / 2.0 + 0.5;
            vec2 diff = neighbor + point - f_st;
            float dist = length(diff);
            if (dot(m_diff - diff, m_diff - diff) > 0.00001) {
                m_dist = min(m_dist, dot( 0.5*(m_diff + diff), normalize(diff - m_diff) ));
            }
        }
    }

    VoronoiResult result;
    result.point = m_diff; // note in voronoi we return m_point
    result.dist = m_dist;
    return result;
}

VoronoiResult tifmk_voronoi(vec2 st) {
    return tifmk_voronoi(st, 0.0);
}

VoronoiResult tifmk_voronoi_metaball(vec2 st) {
    return tifmk_voronoi_metaball(st, 0.0);
}

VoronoiResult tifmk_voronoi_borders(vec2 st) {
    return tifmk_voronoi_borders(st, 0.0);
}

#endif

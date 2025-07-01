
#ifndef TIFMK_SHAPES_GLSL
#define TIFMK_SHAPES_GLSL

#include /src/glsl/math

float tifmk_plot(vec2 p, float pct) { // pct means "percentage" / p is st (surface texture coordinate)
    return  smoothstep(pct - 0.01, pct, p.y) -
    smoothstep(pct, pct + 0.01, p.y);
}

float tifmk_lineSegment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a, ba = b - a;
    // 0..1 gradient between a and b
    // representing how much projection is between each pixel pa and the vector ba
    // dot(pa, ba) says: “How much of pa goes in the same direction as ba?”
    // dot(ba, ba) is the squared length of the stick.
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0 );
    return smoothstep(0.0, 0.001, length(pa - ba * h));
}

float tifmk_circle(in vec2 p, in float radius) {
    vec2 dist = p - vec2(0.5);
    return 1. - smoothstep(radius - (radius * 0.01), radius + (radius * 0.01), dot(dist, dist) * 4.0);
}

float tifmk_rectangle(in vec2 p, in vec2 size) {
    p = p * 2.0 - 1.0; // remap to [-1, 1] range
    return step(0.01, 1.0 - max( abs(p.x / size.x), abs(p.y / size.y) ));
}

float tifmk_roundedRectangle(in vec2 p) {
    p = p * 2.0 - 1.0; // remap to [-1, 1] range
    return 1.0 - step(0.1, length(max(abs(p)-.5, 0.0)));
}

float tifmk_flower(in vec2 p, in int sides) {
    vec2 pos = (vec2(0.5) - p) * 2.0; // remap to [-1, 1] range

    float r = length(pos);
    float a = atan(pos.y,pos.x);

    float f;
    //f = (a / (2.0 * 3.14) + 0.5);
    f = cos(a * float(sides));
    //f = abs(cos(a * 1.0));
    //f = abs(cos(a * 3.));
    //f = abs(cos(a * 2.5)) * .5 + .3;

    return 1. - smoothstep(f, f+0.02 , r);
}

float tifmk_polygon(in vec2 p, in int sides) {
    p = (vec2(0.5) - p) * 2.0; // remap to [-1, 1] range
    float d = 0.0;
    float a = atan(p.y, p.x) + PI;
    float N = float(sides);
    float r = TWO_PI / N; // wedge angle
    // Shaping function that modulate the distance
    // floor(.5 + a/r) * r => slice_index * wedge_angle = center_angle_of_that_slice
    d = cos(floor(.5 + a/r) * r - a) * length(p);
    return 1.0 - smoothstep(.3, .31, d);
}

#endif

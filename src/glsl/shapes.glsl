
float plot(vec2 p, float pct) { // pct means "percentage" / p is st (surface texture coordinate)
    return  smoothstep(pct - 0.01, pct, p.y) -
    smoothstep(pct, pct + 0.01, p.y);
}

float lineSegment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a, ba = b - a;
    // 0..1 gradient between a and b
    // representing how much projection is between each pixel pa and the vector ba
    // dot(pa, ba) says: “How much of pa goes in the same direction as ba?”
    // dot(ba, ba) is the squared length of the stick.
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0 );
    return smoothstep(0.0, 0.001, length(pa - ba * h));
}

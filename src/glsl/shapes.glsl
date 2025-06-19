
float plot(vec2 st, float pct) { // pct means "percentage"
    return  smoothstep(pct - 0.01, pct, st.y) -
    smoothstep(pct, pct + 0.01, st.y);
}

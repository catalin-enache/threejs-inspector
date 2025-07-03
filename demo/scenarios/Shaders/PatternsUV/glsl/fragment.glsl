#include /src/glsl/math
#include /src/glsl/transformations
#include /src/glsl/uv
#include /src/glsl/noise
#include /src/glsl/shapes
#include /src/glsl/color
#include /src/glsl/voronoi
#include /src/glsl/worley
#include /src/glsl/iqnoise
#include /node_modules/lygia/generative/voronoi


uniform int uPattern;
uniform vec4 uVars;
uniform float uTime;

varying vec2 vUv;
varying vec2 vResolution;


void main() {
    if (uPattern == 1) {
        vec2 st = vec2(vUv.x, vUv.y + vUv.x * uVars.x * 2.0);
        float steps = 10.0 + floor(uVars.y * 10.0);
        gl_FragColor = vec4(vec3(mod(st.y * steps, 1.0)), 1.0);
    } else if (uPattern == 2) {
        gl_FragColor = vec4(vec3(step(0.5, mod(vUv.y * 10.0, 1.0))), 1.0);
    }  else if (uPattern == 3) {
        gl_FragColor = vec4(vec3(step(0.9, mod((vUv.y) * 10.0, 1.0))) + vec3(step(0.9, mod((vUv.x) * 10.0, 1.0))), 1.0);
    } else if (uPattern == 4) {
        gl_FragColor = vec4(vec3(step(0.9, mod((vUv.y) * 10.0, 1.0))) * vec3(step(0.9, mod((vUv.x) * 10.0, 1.0))), 1.0);
    } else if (uPattern == 5) {
        vec3 barX = vec3(step(0.9, mod((vUv.y) * 10.0, 1.0))) * vec3(step(0.4, mod((vUv.x) * 10.0, 1.0)));
        vec3 barY = vec3(step(0.9, mod((vUv.x) * 10.0, 1.0))) * vec3(step(0.4, mod((vUv.y) * 10.0, 1.0)));
        gl_FragColor = vec4(barX + barY, 1.0);
    } else if (uPattern == 6) {
        float offsetStrength = uVars.x == 0.0 ? 1.0 : uVars.x * 2.0;
        float barX = step(0.4, mod(vUv.x * 10.0 - 0.2 * offsetStrength, 1.0)) * step(0.8, mod(vUv.y * 10.0, 1.0));
        float barY = step(0.8, mod(vUv.x * 10.0, 1.0)) * step(0.4, mod(vUv.y * 10.0 - 0.2 * offsetStrength, 1.0));
        float strength = barX + barY;
        gl_FragColor = vec4(vec3(strength), 1.0);
    } else if (uPattern == 7) {
        gl_FragColor = vec4(abs(0.5 - vec3(vUv.x)) * 2.0 ,1.0);
    } else if (uPattern == 8) {
        gl_FragColor = vec4(min(abs(0.5 - vec3(vUv.x)), abs(0.5 - vec3(vUv.y))), 1.0);
    } else if (uPattern == 9) {
        gl_FragColor = vec4(max(abs(0.5 - vec3(vUv.x)), abs(0.5 - vec3(vUv.y))), 1.0);
    } else if (uPattern == 10) {
        gl_FragColor = vec4(step(0.25, max(abs(0.5 - vec3(vUv.x)), abs(0.5 - vec3(vUv.y)))), 1.0);
    } else if (uPattern == 11) {
        vec3 square_1 = vec3(step(0.25, max(abs(0.5 - vec3(vUv.x)), abs(0.5 - vec3(vUv.y)))));
        vec3 square_2 = 1.0 - vec3(step(0.30, max(abs(0.5 - vec3(vUv.x)), abs(0.5 - vec3(vUv.y)))));
        gl_FragColor = vec4(square_1 * square_2, 1.0);
    } else if (uPattern == 12) {
        gl_FragColor = vec4(vec3(floor(vUv.y * 10.0) / 10.0), 1.0);
    } else if (uPattern == 13) {
        gl_FragColor = vec4(vec3(floor(vUv.y * 10.0) / 10.0 * floor(vUv.x * 10.0) / 10.0), 1.0);
    } else if (uPattern == 14) {
        gl_FragColor = vec4(vec3(tifmk_random(vUv.xy)), 1.0);
    } else if (uPattern == 15) {
        vec2 st = vUv.xy * 10.0;
//        vec2 st = vec2((vUv.x + vUv.y/50.0) * 10.0, vUv.y * 10.0);
        vec2 ipos = floor(st); // integer part
        vec2 fpos = fract(st); // fraction part
        float rnd = tifmk_random(ipos);

        float col = 3.0;
        float row = 2.0;
        float cellMatch1 = tifmk_selectGridCell(st, int(floor(uVars.x * 10.0)), int(floor(uVars.x * 10.0)));
        float cellMatch2 = tifmk_selectGridCell(st, int(floor(uVars.y * 10.0)), int(floor(uVars.y * 10.0)));

        float circ = tifmk_circle(fpos, 0.3);

        vec3 bgColor = vec3(rnd);
        vec3 cellColor = vec3(0.2, 1.0, 0.2);

        float mask = circ * cellMatch1 + circ * cellMatch2;


        gl_FragColor = vec4(mix(bgColor, cellColor, mask), 1.0);

    } else if (uPattern == 16) {
        vec2 st = vUv.xy * 10.0;
//        st = st - vec2(5.0); // translate 0,0 be the center
//        st *= 5.0; // scale (zoom out)
        vec2 ipos = floor(st); // integer part
        vec2 fpos = fract(st); // fraction part
        float rnd = tifmk_random(ipos);

        float color = 0.0;
//        vec2 tile = fpos;
        vec2 tile = tifmk_truchetPattern(fpos, rnd);
//        color = fpos.y;
        if (floor(uVars.x * 10.0) == 0.0) {
            // Maze
            color = smoothstep(tile.x - 0.3, tile.x, tile.y) -
            smoothstep(tile.x, tile.x + 0.3, tile.y);
        } else if (floor(uVars.x * 10.0) == 1.0) {
            // Circles
            color = (step(length(tile), 0.6) - step(length(tile), 0.4)) +
                    (step(length(tile - vec2(1.)), 0.6) - step(length(tile - vec2(1.)), 0.4));
        } else {
            // Truchet (2 triangles)
            color = step(tile.x, tile.y);
        }

        gl_FragColor = vec4(vec3(color), 1.0);

    } else if (uPattern == 17) {
        gl_FragColor = vec4(1.0 - vec3(distance(vUv, vec2(uVars.x, uVars.y))), 1.0);
    } else if (uPattern == 18) {
        gl_FragColor = vec4(0.01 / vec3(distance(vUv, vec2(uVars.x, uVars.y))), 1.0);
    } else if (uPattern == 19) {
        vec2 vUvRot = tifmk_rotate2D(vUv, 2.0 * PI * uVars.x, vec2(0.5));
        float stretch = uVars.y == 0.0 ? 0.2 : (1.0 - uVars.y);
        float lightX = 0.01 / distance(vec2(vUvRot.x * stretch, vUvRot.y), vec2(0.5 * stretch, 0.5));
        float lightY = 0.01 / distance(vec2(vUvRot.x , vUvRot.y * stretch), vec2(0.5, 0.5 * stretch));
        gl_FragColor = vec4(vec3(lightX * lightY), 1.0);
    } else if (uPattern == 20) {
        vec2 wavedUv = vec2(
            vUv.x + sin(vUv.y * 30.0) * uVars.z,
            vUv.y + sin(vUv.x * 30.0) * uVars.z
        );
        float d = abs(distance(wavedUv, vec2(0.5)) - uVars.x);
        if (uVars.y * 10.0 > 1.0) {
            d = step(0.01, d);
        }
        gl_FragColor = vec4(vec3(d), 1.0);
    } else if (uPattern == 21) {
        float angle = atan(vUv.y - uVars.y, vUv.x - uVars.x) / (PI * 2.0) + 0.5;
        float angles = mod(angle * (uVars.z * 10.0 + 1.0), 1.0);
        gl_FragColor = vec4(vec3(angles), 1.0);
    } else if (uPattern == 22) {
        float angle = atan(vUv.y - 0.5, vUv.x - 0.5) / (PI * 2.0) + 0.5;
        float wave = sin(angle * (1.0 + uVars.x * 50.0));
        gl_FragColor = vec4(vec3(wave), 1.0);
    } else if (uPattern == 23) {
        float angle = atan(vUv.y - 0.5, vUv.x - 0.5) / (PI * 2.0) + 0.5;
        float sinusoid = sin(angle * (1.0 + uVars.y * 100.0));
        float radius = 0.25;

        if (floor(uVars.x * 10.0) < 1.0) {
            radius *= sinusoid;
        } else {
            radius += sinusoid / 50.0;
        }

        float d = abs(distance(vUv, vec2(0.5)) - radius);
        float circle = 1.0 - step(0.01, d);

        gl_FragColor = vec4(vec3(circle), 1.0);
    } else if (uPattern == 24) {
        float pNoise = tifmk_cnoise(vUv * (1.0 + uVars.x * 100.0));
        gl_FragColor = vec4(vec3(pNoise), 1.0);
    } else if (uPattern == 25) {
        float pNoise = step(0.1, tifmk_cnoise(vUv * (1.0 + uVars.x * 100.0)));
        gl_FragColor = vec4(vec3(pNoise), 1.0);
    } else if (uPattern == 26) {
        float pNoise = sin(tifmk_cnoise(vUv * (1.0 + uVars.x * 100.0)) * 20.0);
        gl_FragColor = vec4(vec3(pNoise), 1.0);
    } else if (uPattern == 27) {
        vec2 uv = vUv;
        uv = tifmk_rotate2D(uv, uVars.x * PI * 2.0, vec2(0.5, 0.5));
        uv *= vec2(3.0, 3.0);
        float isOddRow = step(1.0, mod(uv.y, 2.0)); // isOddRow = mod(x, 2.0) < 1.0 ? 0. : 1. ;
        uv.x += uVars.z * isOddRow; // offset odd rows
        vec2 tile = fract(uv);
        ivec2 cell = ivec2(1, 1);
        float cellMatch = tifmk_selectGridCell(uv, cell.y, cell.x); // 0 or 1 if in the cell

        tile -= 0.5;
        float d = length(tile);
        vec2 dir = (d > 0.0) ? tile / d : vec2(0.0); // prevent NaN at center
        tile -= dir * ((1.0 - d) * 0.1);
        tile += 0.5;
        tile = tifmk_rotate2D(tile, uVars.y * PI * 2.0, vec2(0.5)); // rotate tile
        float shape = tifmk_rectangle(tile, vec2(0.3, 0.2)); // draw shape in the rotated tile
        tile = tifmk_rotate2D(tile, -uVars.y * PI * 2.0, vec2(0.5)); // rotate back the tile

        float mask =  shape * cellMatch;

        gl_FragColor = vec4(mix(vec3(tile, 0.0), vec3(1.0,1.0,0.0), mask), 1.0);
    } else if (uPattern == 28) {
        // dot corners influence from gradient noise https://thebookofshaders.com/11/
        vec2 st = vUv;
        vec2 v = (uVars.xy - vec2(0.5)) * 2.0;
        st = (st - vec2(0.5)) * 2.0;
        float circle = 1.0 - step(0.1, length(st - v));
        float f = dot(v, st - v) * 2.0; // projection of st on v
        float draw = circle + f;
        gl_FragColor = vec4(vec3(draw), 1.0);
    } else if (uPattern == 29) {
        // dot corners influence from gradient noise https://thebookofshaders.com/11/
        vec2 st = vUv;

        vec2 f = fract(st);
        vec2 u = f*f*(3.0-2.0*f);

        float f0 = dot(vec2(1.0, 1.0), f - vec2(0.0, 0.0));
        float f1 = dot(vec2(0.0, 1.0), f - vec2(1.0, 0.0));
        float f2 = dot(vec2(1.0, 0.0), f - vec2(0.0, 1.0));
        float f3 = dot(vec2(0.0, 0.0), f - vec2(1.0, 1.0));

        vec2 rand = vec2(floor(uVars.x * 20.0), floor(uVars.y * 20.0));

        f0 = dot(tifmk_random2(rand + vec2(0.0,0.0) ), f - vec2(0.0,0.0));
        f1 = dot(tifmk_random2(rand + vec2(1.0,0.0) ), f - vec2(1.0,0.0));
        f2 = dot(tifmk_random2(rand + vec2(0.0,1.0) ), f - vec2(0.0,1.0));
        f3 = dot(tifmk_random2(rand + vec2(1.0,1.0) ), f - vec2(1.0,1.0));

        float m = mix(mix(f0, f1, u.x), mix(f2, f3, u.x), u.y) * 2.0;

        gl_FragColor = vec4(vec3(m), 1.0);

    }
    else if (uPattern == 30) {
        // https://www.youtube.com/watch?v=f4s1h2YETNY&ab_channel=kishimisu
        vec2 uv = vUv;
        uv = (uv - vec2(0.5)) * 2.0; // remap to [-1, 1] range
        vec2 uv0 = uv;
        float d;
        vec3 finalColor = vec3(0.0);
        vec2 tile = uv;

        for (float i = 0.0; i < 4.0; i++) {
            tile *= 1.5;
            tile = fract(tile);
            tile = (tile - vec2(0.5));

            d = length(tile) * exp(-length(uv0));
            vec3 col = tifmk_palette(
                length(uv0) + i*.4 + uTime/4.,
                vec3(0.5, 0.5, 0.5),
                vec3(0.5, 0.5, 0.5),
                vec3(1.0, 1.0, 1.0),
                vec3(0.263, 0.416, 0.557)
            );

            d = sin(d * 8. + uTime)/8.;
            d = abs(d);
//            d = 0.01 / d;
            d = pow(0.01 / d, 1.2); // make it more contrasty

            finalColor += col * d;
        }

        gl_FragColor = vec4(finalColor, 1.0);

    } else if (uPattern == 31) {
        vec2 st = vUv;
        vec3 color = vec3(0.0);

        st *= 3.;

        vec2 i_st = floor(st);
        vec2 f_st = fract(st);

        // Voronoi result
        VoronoiResult voronoiResult = tifmk_voronoi(st, uTime * .5);
        float m_dist = voronoiResult.dist;
        vec2 m_point = voronoiResult.point;

//        color += pow(1. - m_dist, 1.);
        color += dot(m_point, vec2(.3, .6)); // The weights .3 and .6 are arbitrary — chosen for visual variety.
        // draw point
        color.rb *= step(0.02, m_dist); // suntract rb from around the point
//        color += 1. - step(0.02, m_dist);
        // draw grid
        color.r += step(0.98, f_st.x) + step(0.98, f_st.y);

        gl_FragColor = vec4(color, 1.0);

    } else if (uPattern == 32) {
        vec2 st = vUv;
        vec3 color = vec3(0.0);

        st *= 3.;

        vec2 i_st = floor(st);
        vec2 f_st = fract(st);

        VoronoiResult voronoiResult = tifmk_voronoi_metaball(st, uTime * .5);
        float m_dist = voronoiResult.dist;
        vec2 m_point = voronoiResult.point;

        // draw point / metabball
        color += step(0.06, m_dist);

        gl_FragColor = vec4(color, 1.0);

    } else if (uPattern == 33) {
        vec4 color = vec4(vec3(0.0), 1.0);
        vec2 st = vUv;

        // https://raw.githubusercontent.com/patriciogonzalezvivo/lygia_examples/main/generative_voronoi.frag
        vec3 d2 = voronoi(vec2(st * 5. + uTime));
        vec3 d3 = voronoi(vec3(st * 5., uTime));

        color.rgb += mix(d2, d3, step(0.5, st.x));

        gl_FragColor = color;

    } else if (uPattern == 34 || uPattern == 35 || uPattern == 36 || uPattern == 37) {
        vec4 color = vec4(vec3(0.0), 1.0);
        vec2 st = vUv;

        // https://raw.githubusercontent.com/patriciogonzalezvivo/lygia_examples/main/generative_worley.frag
        vec2 d2 = tifmk_worley2(vec2(st*10.0 + uTime));
        vec2 d3 = tifmk_worley2(vec3(st*10.0, uTime));

        if (uPattern == 34) {
            // var 1 F1 distance
            color += mix(d2.x, d3.x, step(0.5, st.x));
        } else if (uPattern == 35) {
            // var 1 F2 distance
            color += mix(d2.y, d3.y, step(0.5, st.x));
        } else if (uPattern == 36) {
            // var 2 F2 - F1 crystals
            color += mix(d2.y, d3.y, step(0.5, st.x));
            color -= mix(d2.x, d3.x, step(0.5, st.x));
        } else if (uPattern == 37) {
            // var 3 - water-ish
            color += mix(d2.y * d2.x, d3.y * d3.x, step(0.5, st.x));
        }

        gl_FragColor = color;

    }  else if (uPattern == 38) {
        vec2 st = vUv * 10.;
        vec3 color = vec3(0.0);
        VoronoiResult voronoiResult = tifmk_voronoi_borders(st, uTime * .5);
        color += voronoiResult.dist;
        color += 1. - smoothstep(0.01, 0.02, voronoiResult.dist); // draw borders;
        color += 1. - smoothstep(0.05, 0.06, length(voronoiResult.point)); // draw feature point

        gl_FragColor = vec4(color, 1.0);

    } else if (uPattern == 39) {
        vec2 st = vUv * 10.;
        vec3 color = vec3(0.0);
        float d = tifmk_iqnoise(st, uVars.x, uVars.y);

        gl_FragColor = vec4(vec3(d), 1.0);

    } else {
        gl_FragColor = vec4(vUv, 0.0, 1.0);
    }

}

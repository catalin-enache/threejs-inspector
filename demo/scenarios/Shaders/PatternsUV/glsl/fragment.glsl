#include /src/glsl/math
#include /src/glsl/uv
#include /src/glsl/patterns
#include /src/glsl/perlinNoise


uniform int uPattern;
uniform vec4 uVars;

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
        gl_FragColor = vec4(vec3(_random(vUv.xy)), 1.0);
    } else if (uPattern == 15) {
        vec2 st = vUv.xy * 10.0;
//        vec2 st = vec2((vUv.x + vUv.y/50.0) * 10.0, vUv.y * 10.0);
        vec2 ipos = floor(st); // integer part
        vec2 fpos = fract(st); // fraction part
        float rnd = _random(ipos);

        float col = 3.0;
        float row = 2.0;
        float cellMatch1 = selectGridCell(ipos, floor(uVars.x * 10.0), floor(uVars.x * 10.0));
        float cellMatch2 = selectGridCell(ipos, floor(uVars.y * 10.0), floor(uVars.y * 10.0));

        // Soft circle inside the every cell
        float d = distance(fpos, vec2(0.5));
        float shapeAlphaMask = smoothstep(0.3, 0.29, d);

        vec3 bgColor = vec3(rnd);
        vec3 cellColor = vec3(0.2, 1.0, 0.2);

        float mask = shapeAlphaMask * cellMatch1 + shapeAlphaMask * cellMatch2;


        gl_FragColor = vec4(mix(bgColor, cellColor, mask), 1.0);

    } else if (uPattern == 16) {
        vec2 st = vUv.xy * 10.0;
//        st = st - vec2(5.0); // translate 0,0 be the center
//        st *= 5.0; // scale (zoom out)
        vec2 ipos = floor(st); // integer part
        vec2 fpos = fract(st); // fraction part
        float rnd = _random(ipos);

        float color = 0.0;
//        vec2 tile = fpos;
        vec2 tile = truchetPattern(fpos, rnd);
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
        vec2 vUvRot = _rotate2D(vUv, 2.0 * PI * uVars.x, vec2(0.5));
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
        float pNoise = cnoise(vUv * (1.0 + uVars.x * 100.0));
        gl_FragColor = vec4(vec3(pNoise), 1.0);
    } else if (uPattern == 25) {
        float pNoise = step(0.1, cnoise(vUv * (1.0 + uVars.x * 100.0)));
        gl_FragColor = vec4(vec3(pNoise), 1.0);
    } else if (uPattern == 26) {
        float pNoise = sin(cnoise(vUv * (1.0 + uVars.x * 100.0)) * 20.0);
        gl_FragColor = vec4(vec3(pNoise), 1.0);
    } else {
        gl_FragColor = vec4(vUv.xy, 0.0, 1.0);
//        gl_FragColor = vec4(gl_FragCoord.xy / vResolution.xy, 0.0, 1.0);
    }

}

import{u as s,r as a,c as r,b as l,O as c,j as n,aj as i,ag as f,ak as x,D as g}from"./projects-Rsz2rpO2.js";import{u,C as v}from"./CustomControl-mprxE-mL.js";import{u as d}from"./useStats-BFpFcYRp.js";import"./inspector-BPavOpPR.js";import"./react-three-fiber.esm-DPR0ny7o.js";var p=`varying vec2 vUv;

void main() {
     gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
     vUv = uv;
}`,m=`#ifndef PI
#define PI 3.1415926535897932384626433832795
#endif

#ifndef TIFMK_MATH_GLSL
#define TIFMK_MATH_GLSL

float _modulo(float a, float b) {
    
    
    return a - floor(a / b) * b;
}

float _random (in float x) {
    return fract(sin(x)*1e4);
}

float _random(in vec2 st)
{
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

vec2 _rotate2D(vec2 st, float rotation, vec2 mid) {
    
    st -= mid; 
    float s = sin(rotation);
    float c = cos(rotation);
    st = vec2(st.x * c - st.y * s, st.x * s + st.y * c); 
    st += mid; 
    return st;
}

#endif
#ifndef TIFMK_UV_GLSL
#define TIFMK_UV_GLSL

float selectGridCell(vec2 ipos, float row, float col) {
    float rowMatch = 1.0 - step(0.5, abs(ipos.y - row));
    float colMatch = 1.0 - step(0.5, abs(ipos.x - col));
    return colMatch * rowMatch;
    
}

#endif
#ifndef TIFMK_PATTERNS_GLSL
#define TIFMK_PATTERNS_GLSL
vec2 truchetPattern(in vec2 _st, in float _index){
    _index = fract(((_index - 0.5) * 2.0));
    if (_index > 0.75) {
        _st = vec2(1.0) - _st; 
    } else if (_index > 0.5) {
        _st = vec2(1.0 - _st.x, _st.y); 
        
    } else if (_index > 0.25) {
        
        _st = vec2(1.0 - _st.y, _st.x); 
    }
    return _st;
}
#endif
#ifndef TIFMK_PERLIN_NOISE_GLSL
#define TIFMK_PERLIN_NOISE_GLSL

vec2 fade(vec2 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }

vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }

float cnoise(vec2 P){
    vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
    vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
    Pi = mod(Pi, 289.0); 
    vec4 ix = Pi.xzxz;
    vec4 iy = Pi.yyww;
    vec4 fx = Pf.xzxz;
    vec4 fy = Pf.yyww;
    vec4 i = permute(permute(ix) + iy);
    vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; 
    vec4 gy = abs(gx) - 0.5;
    vec4 tx = floor(gx + 0.5);
    gx = gx - tx;
    vec2 g00 = vec2(gx.x,gy.x);
    vec2 g10 = vec2(gx.y,gy.y);
    vec2 g01 = vec2(gx.z,gy.z);
    vec2 g11 = vec2(gx.w,gy.w);
    vec4 norm = 1.79284291400159 - 0.85373472095314 *
    vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
    g00 *= norm.x;
    g01 *= norm.y;
    g10 *= norm.z;
    g11 *= norm.w;
    float n00 = dot(g00, vec2(fx.x, fy.x));
    float n10 = dot(g10, vec2(fx.y, fy.y));
    float n01 = dot(g01, vec2(fx.z, fy.z));
    float n11 = dot(g11, vec2(fx.w, fy.w));
    vec2 fade_xy = fade(Pf.xy);
    vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
    float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
    return 2.3 * n_xy;
}

#endif
varying vec2 vUv;

uniform int uPattern;
uniform vec4 uVars;

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

        vec2 ipos = floor(st); 
        vec2 fpos = fract(st); 
        float rnd = _random(ipos);

        float col = 3.0;
        float row = 2.0;
        float cellMatch1 = selectGridCell(ipos, floor(uVars.x * 10.0), floor(uVars.x * 10.0));
        float cellMatch2 = selectGridCell(ipos, floor(uVars.y * 10.0), floor(uVars.y * 10.0));

        
        float d = distance(fpos, vec2(0.5));
        float shapeAlphaMask = smoothstep(0.3, 0.29, d);

        vec3 bgColor = vec3(rnd);
        vec3 cellColor = vec3(0.2, 1.0, 0.2);

        float mask = shapeAlphaMask * cellMatch1 + shapeAlphaMask * cellMatch2;

        gl_FragColor = vec4(mix(bgColor, cellColor, mask), 1.0);

    } else if (uPattern == 16) {
        vec2 st = vUv.xy * 10.0;

        vec2 ipos = floor(st); 
        vec2 fpos = fract(st); 
        float rnd = _random(ipos);

        float color = 0.0;

        vec2 tile = truchetPattern(fpos, rnd);

        if (floor(uVars.x * 10.0) == 0.0) {
            
            color = smoothstep(tile.x - 0.3, tile.x, tile.y) -
            smoothstep(tile.x, tile.x + 0.3, tile.y);
        } else if (floor(uVars.x * 10.0) == 1.0) {
            
            color = (step(length(tile), 0.6) - step(length(tile), 0.4)) +
                    (step(length(tile - vec2(1.)), 0.6) - step(length(tile - vec2(1.)), 0.4));
        } else {
            
            color = step(tile.x, tile.y);
        }

        gl_FragColor = vec4(vec3(color), 1.0);

    } else if (uPattern == 17) {
        gl_FragColor = vec4(1.0 - vec3(distance(vUv, vec2(uVars.x, uVars.y))), 1.0);
    } else if (uPattern == 18) {
        gl_FragColor = vec4(0.01 / vec3(distance(vUv, vec2(uVars.x, uVars.y))), 1.0);
    } else if (uPattern == 19) {
        vec2 vUvRot = _rotate2D(vUv, PI/180.0*360.0*uVars.x, vec2(0.5));
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
        gl_FragColor = vec4(vec2(1.0 - vUv.y, vUv.x), 0.0, 1.0);
    }

}`;const _=new f(10,10,1,1),o=new i({vertexShader:p,fragmentShader:m,wireframe:!1,side:g,transparent:!1,uniforms:{uPattern:{value:1},uVars:{value:new x(0,0,0,0)}}});function S(){const{scene:t,camera:e}=s();return d(),a.useEffect(()=>r.registerDefaultPlayTriggers(),[]),a.useEffect(()=>(r.updateSceneBBox(),t.background=new l().setHex(0),()=>{t.background=null}),[t]),a.useEffect(()=>{e.position.set(0,0,9),e.rotation.set(0,0,0),e instanceof c&&(e.zoom=65)},[e]),u((y,U,P)=>{}),n.jsxs(n.Fragment,{children:[n.jsx("mesh",{position:[0,0,0],name:"mesh",__inspectorData:{isInspectable:!0},geometry:_,material:o}),n.jsx(v,{name:"pattern",object:o.uniforms.uPattern,prop:"value",control:{label:"Pattern",min:1,max:30,step:1}}),n.jsx(v,{name:"vars",object:o.uniforms.uVars,prop:"value",control:{label:"Vars",x:{min:0,max:1,step:.01,pointerScale:.01},y:{min:0,max:1,step:.01,pointerScale:.01},z:{min:0,max:1,step:.01,pointerScale:.01},w:{min:0,max:1,step:.01,pointerScale:.01}}})]})}export{S as Pattern,S as default};
//# sourceMappingURL=Pattern-D9FX5B77.js.map

import{u as p,r as t,ag as i,c as v,b as m,O as d,j as n,aj as u,D as _}from"./projects-BRTcxqWl.js";import{u as g,C as l}from"./CustomControl-DaYTGWX8.js";import{u as x}from"./useStats-BMUJc4js.js";import"./inspector-BGeovSOK.js";import"./react-three-fiber.esm-BCsrm-ud.js";var U=`varying vec2 vUv;

void main() {
     gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
     vUv = uv;
}`,b=`#ifndef TIFMK_MATH_GLSL
#define TIFMK_MATH_GLSL

float _modulo(float a, float b) {
    
    
    return a - floor(a / b) * b;
}

float _random(vec2 st)
{
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
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
varying vec2 vUv;

uniform int uPattern;

void main() {
    if (uPattern == 1) {
        gl_FragColor = vec4(vec3(mod(vUv.y * 10.0, 1.0)), 1.0);
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
        vec3 barX = vec3(step(0.8, mod((vUv.y) * 10.0, 1.0))) * vec3(step(0.4, mod((vUv.x-0.02) * 10.0, 1.0)));
        vec3 barY = vec3(step(0.8, mod((vUv.x) * 10.0, 1.0))) * vec3(step(0.4, mod((vUv.y-0.02) * 10.0, 1.0)));
        gl_FragColor = vec4(barX + barY, 1.0);
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
        float cellMatch1 = selectGridCell(ipos, 2.0, 3.0);
        float cellMatch2 = selectGridCell(ipos, 2.0, 4.0);

        
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

        
        color = smoothstep(tile.x - 0.3, tile.x, tile.y) -
                smoothstep(tile.x, tile.x + 0.3, tile.y);

        

        

        gl_FragColor = vec4(vec3(color), 1.0);

    } else {
        gl_FragColor = vec4(vec2(1.0 - vUv.y, vUv.x), 0.0, 1.0);
    }

}`;const a=new i(10,10,1,1),c=new u({vertexShader:U,fragmentShader:b,wireframe:!1,side:_,transparent:!1,uniforms:{uPattern:{value:1}}});function S(){const{scene:o,camera:e}=p();x();const f=t.useRef({tessellation:a.parameters.heightSegments});return t.useEffect(()=>v.registerDefaultPlayTriggers(),[]),t.useEffect(()=>(v.updateSceneBBox(),o.background=new m().setHex(0),()=>{o.background=null}),[o]),t.useEffect(()=>{e.position.set(0,0,9),e.rotation.set(0,0,0),e instanceof d&&(e.zoom=65)},[e]),g((r,s,y)=>{}),n.jsxs(n.Fragment,{children:[n.jsx("mesh",{position:[0,0,0],name:"mesh",__inspectorData:{isInspectable:!0},geometry:a,material:c}),n.jsx(l,{name:"tessellation",object:f.current,prop:"tessellation",control:{label:"Tessellation",min:1,max:256,step:1,onChange:r=>{a.dispose();const s=new i(10,10,r,r);a.copy(s)}}}),n.jsx(l,{name:"pattern",object:c.uniforms.uPattern,prop:"value",control:{label:"Pattern",min:1,max:20,step:1}})]})}export{S as Pattern,S as default};
//# sourceMappingURL=Pattern-C0Qkgo1w.js.map

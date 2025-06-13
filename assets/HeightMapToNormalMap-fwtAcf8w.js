import{u as l,r,c as s,b as u,O as v,j as e,aj as c,ag as p,D as m}from"./projects-Rsz2rpO2.js";import{u as g,C as o}from"./CustomControl-mprxE-mL.js";import{u as h}from"./useStats-BFpFcYRp.js";import"./inspector-BPavOpPR.js";import"./react-three-fiber.esm-DPR0ny7o.js";var M=`varying vec2 vUv;

void main() {
     gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
     vUv = uv;
}`,_=`#ifndef SAMPLER_FNC
#if __VERSION__ >= 300
#define SAMPLER_FNC(TEX, UV) texture(TEX, UV)
#else
#define SAMPLER_FNC(TEX, UV) texture2D(TEX, UV)
#endif
#endif

#ifndef SAMPLER_TYPE
#define SAMPLER_TYPE sampler2D
#endif
#ifndef FNC_POW3
#define FNC_POW3

float pow3(const in float v) { return v * v * v; }
vec2 pow3(const in vec2 v) { return v * v * v; }
vec3 pow3(const in vec3 v) { return v * v * v; }
vec4 pow3(const in vec4 v) { return v * v * v; }

#endif

#ifndef SAMPLE_CHANNEL
#define SAMPLE_CHANNEL 0
#endif

vec3 normalFromHeightMap(SAMPLER_TYPE heightMap, vec2 st, float strength, float offset)
{
    offset = pow3(offset) * 0.1;
    
    float p = SAMPLER_FNC(heightMap, st)[SAMPLE_CHANNEL];
    float h = SAMPLER_FNC(heightMap, st + vec2(offset, 0.0))[SAMPLE_CHANNEL];
    float v = SAMPLER_FNC(heightMap, st + vec2(0.0, offset))[SAMPLE_CHANNEL];

    vec3 a = vec3(1, 0, (h - p) * strength);
    vec3 b = vec3(0, 1, (v - p) * strength);

    return normalize(cross(a, b));
}

vec3 normalFromHeightMap(SAMPLER_TYPE heightMap, vec2 st, float strength)
{
    return normalFromHeightMap(heightMap, st, strength, 0.5);

}

uniform sampler2D uHeightMap;
uniform float uIntensity;
uniform float uOffset;

varying vec2 vUv;

void main() {
    vec4 textureColor = texture2D(uHeightMap, vUv);
    
    vec3 normal = normalFromHeightMap(uHeightMap, vUv, uIntensity, uOffset);
    normal = normal * 0.5 + 0.5; 
    gl_FragColor = vec4(normal, 1.0);
}`;const E=(await s.createTexturesFromImages("textures/pbr/castle_brick_02/castle_brick_02_red_4k_disp.jpg"))[0],d=new p(10,10,1,1),t=new c({vertexShader:M,fragmentShader:_,wireframe:!1,side:m,transparent:!1,uniforms:{uHeightMap:{value:E},uIntensity:{value:2},uOffset:{value:.3}}});function H(){const{scene:a,camera:n,gl:f}=l();return h(),r.useEffect(()=>s.registerDefaultPlayTriggers(),[]),r.useEffect(()=>(s.updateSceneBBox(),a.background=new u().setHex(0),()=>{a.background=null}),[a]),r.useEffect(()=>{n.position.set(0,0,9),n.rotation.set(0,0,0),n instanceof v&&(n.zoom=65)},[n]),g((i,x,P)=>{}),e.jsxs(e.Fragment,{children:[e.jsx("mesh",{position:[0,0,0],name:"mesh",__inspectorData:{isInspectable:!0},geometry:d,material:t}),e.jsx(o,{name:"uIntensity",object:t.uniforms.uIntensity,prop:"value",control:{label:"Intensity",min:0,max:10,step:.1}}),e.jsx(o,{name:"uOffset",object:t.uniforms.uOffset,prop:"value",control:{label:"Offset",min:-1,max:1,step:.01}}),e.jsx(o,{name:"uHeightMap",object:t.uniforms.uHeightMap,prop:"value",control:{label:"Height Map",gl:f,color:{type:"float"},onChange:(...i)=>{console.log("Experience reacting to SceneBG value change",i)}}})]})}export{H as HeightMapToNormalMap,H as default};
//# sourceMappingURL=HeightMapToNormalMap-fwtAcf8w.js.map

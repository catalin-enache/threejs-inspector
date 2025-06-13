import{u as p,r as i,ag as c,c as m,b as d,O as x,j as o,ah as y,ai as g,D as b,Z as h}from"./projects-BRTcxqWl.js";import{u as j,C as l}from"./CustomControl-DaYTGWX8.js";import{u as w}from"./useStats-BMUJc4js.js";import"./inspector-BGeovSOK.js";import"./react-three-fiber.esm-BCsrm-ud.js";var T=`uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform vec2 uFrequency;
uniform float uTime;
uniform float uIntensity;

attribute vec3 position;
attribute vec2 uv;
attribute float aRandom;

varying float vRandom;
varying float vElevation;
varying vec2 vUv;

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    float elevation = sin(modelPosition.x * uFrequency.x - uTime) * uIntensity;
    elevation += sin(modelPosition.y * uFrequency.y - uTime) * uIntensity;
    modelPosition.z += elevation;
    modelPosition.y *= 0.5; 

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;
    
    
    vRandom = aRandom;
    vUv = uv;
    vElevation = elevation;
}`,P=`precision mediump float;

uniform sampler2D uTexture;

varying float vRandom;
varying vec2 vUv;
varying float vElevation;

void main() {

    vec4 textureColor = texture2D(uTexture, vUv);
    textureColor.r += vRandom * 0.4;
    textureColor.rgb *= vElevation * 0.35 + 1.0;
    gl_FragColor = textureColor;
}`;const a=new c(10,10,64,64),v=t=>{const e=t.attributes.position.count,r=new Float32Array(e);for(let n=0;n<e;n++)r[n]=Math.random();t.setAttribute("aRandom",new h(r,1))};v(a);const F=(await m.createTexturesFromImages("textures/pbr/floors/FloorsCheckerboard_S_Diffuse.jpg"))[0],s=new y({vertexShader:T,fragmentShader:P,wireframe:!1,side:b,transparent:!1,uniforms:{uIntensity:{value:.5},uFrequency:{value:new g(.5,.5)},uTime:{value:0},uTexture:{value:F}}});function M(){const{scene:t,camera:e}=p();w();const r=i.useRef({tessellation:a.parameters.heightSegments});return i.useEffect(()=>m.registerDefaultPlayTriggers(),[]),i.useEffect(()=>(m.updateSceneBBox(),t.background=new d().setHex(0),()=>{t.background=null}),[t]),i.useEffect(()=>{e.position.set(0,0,22),e.rotation.set(0,0,0),e instanceof x&&(e.zoom=30)},[e]),j((n,u,C)=>{const f=u.clock.elapsedTime;s.uniforms.uTime.value=f}),o.jsxs(o.Fragment,{children:[o.jsx("mesh",{position:[0,0,0],name:"mesh",__inspectorData:{isInspectable:!0},geometry:a,material:s}),o.jsx(l,{name:"tessellation",object:r.current,prop:"tessellation",control:{label:"Tessellation",min:1,max:256,step:1,onChange:n=>{a.dispose();const u=new c(10,10,n,n);a.copy(u),v(a)}}}),o.jsx(l,{name:"uIntensity",object:s.uniforms.uIntensity,prop:"value",control:{label:"Intensity",min:0,max:1,step:.1}}),o.jsx(l,{name:"uFrequency",object:s.uniforms.uFrequency,prop:"value",control:{label:"Frequency",x:{min:0,max:2,step:.1},y:{min:0,max:2,step:.1}}})]})}export{M as Flag,M as default};
//# sourceMappingURL=Flag-DaLAkqxV.js.map

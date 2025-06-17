import math from 'src/glsl/math.glsl';

export const addUniforms = `
  ${math}
  
  uniform vec4 uVars;
`;

export const declarations = `
  float angle = PI/2.0 * position.z * uVars.x;
  mat2 rotationMatrix = _getRotate2dMat(angle);
`;

export const distortNormals = `
  // objectNormal.x += uVars.x;
  // objectNormal.y += uVars.y;
  // objectNormal.z += uVars.z;
  
  objectNormal.xy = rotationMatrix * objectNormal.xy;
`;

export const distortPositions = `
  // transformed.x += uVars.x;
  // transformed.y += uVars.y;
  // transformed.z += uVars.z;

  transformed.xy = rotationMatrix * transformed.xy;
`;

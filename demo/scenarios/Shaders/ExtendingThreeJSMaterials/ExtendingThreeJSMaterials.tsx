import * as THREE from 'three';
import { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
// @ts-ignore
import { CustomControl } from 'src/components/CustomControl/CustomControl';
import { usePlay } from 'src/lib/hooks';
import { useStats } from 'lib/hooks';
import { api } from 'src';

import { addUniforms, declarations, distortNormals, distortPositions } from './glsl/includes.glsl';

const uVars = {
  value: new THREE.Vector4(0, 0, 0, 0)
};

const object = (await api.loadObject(
  ['models/FromThreeRepo/gltf_glb/DamagedHelmet/glTF/DamagedHelmet.gltf'],
  {}
))! as THREE.Mesh;

object.__inspectorData.isInspectable = true;

const mesh = object.children[0] as THREE.Mesh;
mesh.castShadow = true;
mesh.receiveShadow = true;

const objectMaterial = mesh.material as THREE.MeshStandardMaterial;

objectMaterial.onBeforeCompile = (shader) => {
  if (shader.uniforms.uVars) return; // already compiled

  shader.uniforms.uVars = uVars;
  shader.vertexShader = shader.vertexShader
    .replace(
      '#include <common>',
      `#include <common>
    ${addUniforms}
    `
    )
    .replace(
      'void main() {',
      `void main() {
    ${declarations}
    `
    )
    .replace(
      '#include <beginnormal_vertex>',
      `#include <beginnormal_vertex>
    ${distortNormals}
    `
    )
    .replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
    ${distortPositions}
    `
    );
};

const depthMaterial = new THREE.MeshDepthMaterial({
  depthPacking: THREE.RGBADepthPacking
});

depthMaterial.onBeforeCompile = (shader) => {
  if (shader.uniforms.uVars) return; // already compiled

  shader.uniforms.uVars = uVars;
  shader.vertexShader = shader.vertexShader
    .replace(
      '#include <common>',
      `#include <common>
    ${addUniforms}
    `
    )
    .replace(
      'void main() {',
      `void main() {
    ${declarations}
    `
    )
    .replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
    ${distortPositions}
    `
    );
};

mesh.customDepthMaterial = depthMaterial;

export function ExtendingThreeJSMaterials() {
  const { scene, camera } = useThree();
  useStats();

  const [sceneBackground, setSceneBackground] = useState<THREE.Texture | THREE.Color | null>(null);

  useEffect(() => {
    return api.registerDefaultPlayTriggers();
  }, []);

  useEffect(() => {
    // because R3F adds geometry asynchronously, after internal setup
    api.updateSceneBBox();

    if (camera instanceof THREE.OrthographicCamera) {
      scene.background = new THREE.Color().setHex(0x000000);
    } else if (sceneBackground instanceof THREE.Texture) {
      scene.background = sceneBackground;
      scene.environment = sceneBackground;
    } else if (sceneBackground instanceof THREE.Color) {
      scene.background = sceneBackground;
      scene.environment = null;
    } else {
      scene.background = new THREE.Color().setHex(0x000000);
      scene.environment = null;
    }

    return () => {
      scene.background = new THREE.Color().setHex(0x000000);
      scene.environment = null;
    };
  }, [scene, sceneBackground, camera]);

  useEffect(() => {
    (async () => {
      // const textures = await api.createTexturesFromImages(
      //   'textures/background/equirectangular/spruit_sunrise_4k.hdr.jpg',
      //   {}
      // );
      // const textures = await api.createTexturesFromImages(
      //   ['px', 'nx', 'py', 'ny', 'pz', 'nz'].map((t) => `textures/background/cube/MilkyWay/dark-s_${t}.jpg`),
      //   {}
      // );
      const textures = await api.createTexturesFromImages(
        ['px', 'nx', 'py', 'ny', 'pz', 'nz'].map((t) => `textures/background/cube/Park3Med/${t}.jpg`),
        {}
      );
      // const textures = await api.createTexturesFromImages(
      //   ['px', 'nx', 'py', 'ny', 'pz', 'nz'].map((t) => `textures/background/cube/skyboxsun25deg/${t}.jpg`),
      //   {}
      // );
      // const textures = await api.createTexturesFromImages(
      //   ['px', 'nx', 'py', 'ny', 'pz', 'nz'].map((t) => `textures/background/cube/pisa/${t}.png`),
      //   {}
      // );

      // @ts-ignore

      const texture = textures[0];
      texture.mapping =
        texture instanceof THREE.CubeTexture
          ? THREE.CubeReflectionMapping // THREE.CubeReflectionMapping, THREE.CubeRefractionMapping
          : texture.image.width / texture.image.height === 2
            ? THREE.EquirectangularReflectionMapping
            : THREE.UVMapping;
      texture.needsUpdate = true;
      setSceneBackground(texture);
    })();
  }, []);

  useEffect(() => {
    camera.position.set(0, 0, 2);
    camera.rotation.set(0, 0, 0);
    if (camera instanceof THREE.OrthographicCamera) {
      camera.zoom = 250;
    }
  }, [camera]);

  usePlay((_playingState, _rootState, _delta) => {});

  return (
    <>
      <directionalLight
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-radius={4}
        shadow-camera-right={15}
        shadow-camera-left={-15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-blurSamples={8}
        shadow-bias={-0.0014}
        castShadow
        position={[-20, 20, 20]}
        scale={1}
        intensity={4.5}
        color={'white'}
      />

      <spotLight
        castShadow
        position={[20, 20, 20]}
        scale={1}
        intensity={6}
        power={20}
        distance={70}
        color={'white'}
        angle={Math.PI / 8}
        penumbra={0.5}
        decay={0.4}
      />

      <ambientLight color={'#ffffff'} intensity={0.1} position={[0, 20, 0]} />

      <mesh
        position={[0, 0, -2]}
        name="plane"
        receiveShadow
        __inspectorData={{ isInspectable: true }}
        geometry={new THREE.PlaneGeometry(10, 10, 1, 1)}
        material={new THREE.MeshStandardMaterial()}
      />

      <primitive object={object} />

      <CustomControl
        name={'vars'}
        object={uVars}
        prop={'value'}
        control={{
          label: 'Vars',
          x: { min: 0, max: 1, step: 0.01, pointerScale: 0.01 },
          y: { min: 0, max: 1, step: 0.01, pointerScale: 0.01 },
          z: { min: 0, max: 1, step: 0.01, pointerScale: 0.01 },
          w: { min: 0, max: 1, step: 0.01, pointerScale: 0.01 }
        }}
      />
    </>
  );
}

export default ExtendingThreeJSMaterials;

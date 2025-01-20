import * as THREE from 'three';
import { useEffect, useRef, useState } from 'react';
import { useFrame, ThreeElements, useThree } from '@react-three/fiber';
// @ts-ignore
import Stats from 'three/addons/libs/stats.module.js';
import { CustomControl } from 'components/CustomControl/CustomControl';
import { usePlay } from 'lib/hooks';
import { degToRad } from 'lib/utils';
import { createTexturesFromImages } from 'lib/utils/loadTexture';
import { TestIndexedCube3Materials } from './TestIndexedCube3Materials';
// import { TestMorphTargets } from './TestMorphTargets';
import { splitMeshesByMaterial } from 'lib/utils/optimiseModel';
// @ts-ignore
import { loadModel } from 'lib/utils/loadModel';
import { LightProbeGenerator } from 'three/examples/jsm/lights/LightProbeGenerator';
import { shadowMapMaterial } from 'lib/utils/customShaders';
import patchThree from 'lib/patchThree';
import { useAppStore } from 'src/store';

const stats = new Stats();
document.body.appendChild(stats.dom);

// @ts-ignore
function Box(
  props: ThreeElements['mesh'] & {
    mapURL: string;
    alphaMapURL?: string;
  }
) {
  const refMesh = useRef<THREE.Mesh>(null!);
  const [hovered, _hover] = useState(false);
  const [clicked, _click] = useState(false);
  const [map, setMap] = useState<THREE.Texture | null>(null);
  const [alphaMap, setAlphaMap] = useState<THREE.Texture | null>(null);
  const meshMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const { position = [0, 0, 0], mapURL, alphaMapURL, ...rest } = props;
  usePlay((playingState, _state, delta) => {
    // console.log('Box usePlay', { playingState, _state, delta });
    if (playingState === 'playing') {
      refMesh.current && (refMesh.current.rotation.x += delta);
      // refMesh.current.position.x = Math.sin(Date.now() / 1000);
      // refMesh?.current && (refMesh.current.position.z = 2);
    } else if (playingState === 'stopped') {
      refMesh.current && (refMesh.current.rotation.x = 0);
    }
  });

  useEffect(() => {
    // 'https://threejsfundamentals.org/threejs/resources/images/wall.jpg',
    // 'textures/file_example_TIFF_10MB.tiff',
    // 'textures/sample_5184×3456.tga',
    // 'textures/checkerboard-8x8.png',
    // 'textures/castle_brick_02_red_nor_gl_4k.exr',
    // 'textures/sikqyan_2K_Displacement.exr',
    createTexturesFromImages(mapURL, { material: meshMaterialRef }).then((textures) => {
      const map = textures[0];
      // console.log('setting map');
      setMap(map);
    });
    alphaMapURL &&
      createTexturesFromImages(alphaMapURL, { material: meshMaterialRef }).then((textures) => {
        const map = textures[0];
        // console.log('setting alphaMap');
        setAlphaMap(map);
      });
  }, [mapURL, alphaMapURL]);

  return (
    <mesh
      {...rest}
      // castShadow={true}
      ref={refMesh}
      scale={clicked ? 1.05 : 1}
      // onClick={(_event) => _click(!clicked)}
      // onPointerOver={(_event) => _hover(true)}
      // onPointerOut={(_event) => _hover(false)}
      position={position}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        ref={meshMaterialRef}
        color={hovered ? 'hotpink' : 'white'}
        map={map}
        alphaMap={alphaMap}
        roughness={0}
        metalness={1}
      />
      {props.children}
    </mesh>
  );
}

export function Experience() {
  // @ts-ignore
  const { scene, gl, clock, camera } = useThree();
  const refDirectionalLight = useRef<THREE.DirectionalLight>(null!);
  const refPointLight = useRef<THREE.PointLight>(null!);
  const refSpotLight = useRef<THREE.SpotLight>(null!);
  const refLightProbe = useRef<THREE.LightProbe>(null!);
  const doorMaterialRef = useRef<THREE.MeshStandardMaterial>(null!);
  const cubeCameraRef = useRef<THREE.CubeCamera>(null!);
  const webGLCubeRenderTargetRef = useRef(
    new THREE.WebGLCubeRenderTarget(1024, {
      // these are not required
      // type: THREE.HalfFloatType // does not work well when reading back the texture in inspector/TexturePlugin
      // format: THREE.RGBAFormat
      // generateMipmaps: true
      // depthTexture: new THREE.DepthTexture(512, 512)
    })
  );
  useFrame((_state, _delta) => {
    stats.update();
    if (refPointLight.current) {
      // refPointLight.current.intensity = Math.sin(Date.now() / 100) + 1;
    }
  });
  // const [myImage, setMyImage] = useState<any>(null);
  const [showOthers, setShowOthers] = useState(false);
  // @ts-ignore
  const [customControlXY, setCustomControlXY] = useState({ x: 0.5, y: 0.5 });
  // @ts-ignore
  const [number, setNumber] = useState(1.23);
  const audioListenerRef = useRef<THREE.AudioListener>(new THREE.AudioListener());

  const customPropsRef = useRef({
    myImage: null,
    myBool: false,
    myNumber: 0.23,
    myPoint: { x: 0.5, y: 0.5 }
  });

  usePlay((_state, _delta) => {
    // setNumber((prev) => {
    //   // console.log('Experience setting new value on play', prev + 0.01);
    //   return prev + 0.01;
    // });
    // setCustomControlXY((prev) => {
    //   return { x: prev.x + 0.01, y: prev.y };
    // });
  });

  useEffect(() => {
    createTexturesFromImages(
      ['alpha.jpg', 'ao.jpg', 'color.jpg', 'height.jpg', 'metalness.jpg', 'normal.jpg', 'roughness.jpg'].map(
        (img) => `textures/pbr/door/${img}`
      )
    ).then((textures) => {
      if (!doorMaterialRef.current) return;
      // console.log(doorMaterialRef.current, textures);
      doorMaterialRef.current.alphaMap = textures[0];
      doorMaterialRef.current.aoMap = textures[1];
      textures[2].colorSpace = THREE.SRGBColorSpace;
      doorMaterialRef.current.map = textures[2];
      doorMaterialRef.current.bumpMap = textures[3];
      doorMaterialRef.current.metalnessMap = textures[4];
      doorMaterialRef.current.normalMap = textures[5];
      doorMaterialRef.current.roughnessMap = textures[6];
      doorMaterialRef.current.metalness = 1;
      doorMaterialRef.current.roughness = 0.7;
      doorMaterialRef.current.transparent = true;
      doorMaterialRef.current.needsUpdate = true;
    });
  }, []);

  useEffect(() => {
    // 'https://threejsfundamentals.org/threejs/resources/images/wall.jpg',
    // 'textures/test/file_example_TIFF_1MB.tiff',
    // 'textures/test/one_gray_channel.exr',
    // 'textures/background/2d/cover-1920.jpg',
    // 'textures/background/equirectangular/2294472375_24a3b8ef46_o.jpg',
    // 'textures/background/equirectangular/TCom_NorwayForest_4K_hdri_sphere.exr'
    // 'textures/background/equirectangular/kloofendal_48d_partly_cloudy_puresky_4k.hdr'
    // 'textures/background/equirectangular/spruit_sunrise_4k.hdr.jpg'
    // ['px', 'nx', 'py', 'ny', 'pz', 'nz'].map((t) => `textures/background/cube/MilkyWay/dark-s_${t}.jpg`)
    // ['px', 'nx', 'py', 'ny', 'pz', 'nz'].map((t) => `textures/background/cube/Park3Med/${t}.jpg`)
    // ['px', 'nx', 'py', 'ny', 'pz', 'nz'].map((t) => `textures/background/cube/skyboxsun25deg/${t}.jpg`)
    // ['px', 'nx', 'py', 'ny', 'pz', 'nz'].map((t) => `textures/background/cube/pisa/${t}.png`)
    createTexturesFromImages('textures/background/equirectangular/spruit_sunrise_4k.hdr.jpg', {}).then((textures) => {
      // console.log('createTextureFromImages', textures);
      const texture = textures[0];
      texture.mapping =
        texture instanceof THREE.CubeTexture
          ? THREE.CubeRefractionMapping // THREE.CubeReflectionMapping, THREE.CubeRefractionMapping
          : texture.image.width / texture.image.height === 2
            ? THREE.EquirectangularRefractionMapping
            : THREE.UVMapping;
      // texture.mapping = THREE.EquirectangularReflectionMapping;
      texture.needsUpdate = true;
      // texture.colorSpace = THREE.SRGBColorSpace;
      if (refLightProbe.current && texture instanceof THREE.CubeTexture) {
        refLightProbe.current.copy(LightProbeGenerator.fromCubeTexture(texture));
        refLightProbe.current.name = 'myLightProbe';
        refLightProbe.current.position.set(0, 0, 3);
        refLightProbe.current.intensity = 1;
      }

      // const pmremGenerator = new THREE.PMREMGenerator(gl);

      // pmremGenerator.compileEquirectangularShader();
      // pmremGenerator.compileCubemapShader();

      // const PMREMRenderTarget = pmremGenerator.fromCubemap(texture as THREE.CubeTexture);
      // const PMREMRenderTarget = pmremGenerator.fromEquirectangular(texture);
      // const PMREMRenderTarget = pmremGenerator.fromScene(scene);
      // PMREMRenderTarget.texture.mapping = THREE.CubeUVReflectionMapping;
      // texture.colorSpace = THREE.SRGBColorSpace;
      // texture.copy(PMREMRenderTarget.texture);
      // texture.source = PMREMRenderTarget.texture.source;
      // texture.image = PMREMRenderTarget.texture.image;
      // console.log('createTextureFromImages', {
      //   texture,
      //   PMREMRenderTarget,
      //   'PMREMRenderTarget.texture': PMREMRenderTarget.texture
      // });
      // scene.background = PMREMRenderTarget.texture;
      // scene.environment = PMREMRenderTarget.texture;
      // texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.background = texture;
      scene.environment = texture;
      // texture.needsPMREMUpdate = true;
      // texture.needsUpdate = true;

      doorMaterialRef.current.envMap = scene.environment;
      useAppStore.getState().triggerCPaneStateChanged();

      patchThree.updateCubeCameras();

      // loadModel('models/FromThreeRepo/ply/binary/Lucy100k.ply', {}).then((mesh) => {
      //   if (!mesh) return;
      //   mesh.name = 'LoadedMesh';
      //
      //   const phongMaterial = new THREE.MeshPhongMaterial({
      //     color: 0xffffff,
      //     envMap: scene.background as THREE.Texture,
      //     refractionRatio: 0.98
      //   });
      //
      //   const s = 0.001;
      //   (mesh as THREE.Mesh).material = phongMaterial;
      //   mesh.position.set(1, 0, 2);
      //   mesh.__inspectorData.isInspectable = true;
      //   mesh.scale.x = mesh.scale.y = mesh.scale.z = s;
      //
      //   scene.add(mesh);
      // });

      // models/Free/fbx/Asuna/2/FreeTestAnimations_reexport.fbx
      // models/MyTests/having space in path/asset with space in path.fbx
      // models/MyTests/with_non_default_textures/with_non_native_textures.fbx
      // models/NonFree/Dark Elf Blader - Game Ready/Assets/Textures/DarkElfBlader_FBX_From3DsMax.fbx
      // models/Free/gltf/Mixamo/Jennifer/Jennifer.glb
      loadModel(['Jennifer.glb', 'Animations_gltf/Idle.glb', 'Animations_gltf/Catwalk_Walk_Forward.glb'], {
        scene,
        camera,
        path: 'models/Free/gltf/Mixamo/Jennifer/'
      }).then((mesh) => {
        if (!mesh) return;
        scene.add(mesh);
      });

      const testIndexedCube3Materials = TestIndexedCube3Materials();
      // const testMorphTargets = TestMorphTargets();
      const recombinedCube = splitMeshesByMaterial(testIndexedCube3Materials, {});
      recombinedCube.castShadow = true;
      recombinedCube.receiveShadow = true;
      // testIndexedCube3Materials.position.set(0, 0, 0);
      // recombinedCube.position.set(0, 3, 0);
      // recombinedCube.name = 'recombinedCube';

      // these are not needed
      // testIndexedCube3Materials.__inspectorData.isInspectable = true;
      recombinedCube.__inspectorData.isInspectable = true;

      // console.log('recombinedCube', { testIndexedCube3Materials, recombinedCube });

      // scene.add(testIndexedCube3Materials);
      scene.add(recombinedCube);
      // scene.add(testMorphTargets);
      // shadowMapMaterial.uniforms.tDiffuse.value = refDirectionalLight.current.shadow.map?.texture;
      // gl.setSize(400, 200);
      // camera.aspect = 400 / 200;
      // camera.updateProjectionMatrix();
    });
  }, []);

  return (
    <>
      <group name="lights group">
        <directionalLight
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-radius={4}
          shadow-camera-right={15}
          shadow-camera-left={-15}
          shadow-camera-top={15}
          shadow-camera-bottom={-15}
          // shadow-bias={-0.001}
          shadow-blurSamples={8}
          castShadow
          position={[2, 2, 2]}
          scale={1}
          intensity={4.5}
          ref={refDirectionalLight}
          color={'white'}
          __inspectorData={{ isInspectable: false }}
        ></directionalLight>
        {/*<hemisphereLight*/}
        {/*  // args={[0xffffff, 0xffffff, 2]}*/}
        {/*  intensity={2}*/}
        {/*  color={new THREE.Color().setHSL(0.6, 1, 0.6)}*/}
        {/*  groundColor={new THREE.Color().setHSL(0.095, 1, 0.75)}*/}
        {/*/>*/}
        {/*<ambientLight color={'#ffffff'} intensity={3.5} position={[0, 1, 0]} />*/}
        <rectAreaLight
          color={'deepskyblue'}
          position={[-3, 0, -8]}
          rotation={[-2.51, 0, 0]}
          intensity={6}
          width={10}
          height={10}
        />
        <pointLight
          castShadow
          // shadow-mapSize={[2048, 2048]}
          position={[0, -2, 0]}
          color={'orange'}
          // decay={0}
          scale={1}
          intensity={Math.PI}
          ref={refPointLight}
          __inspectorData={{ isInspectable: false }}
        />

        <spotLight
          castShadow
          position={[5.5, -0.7, 0.3]}
          scale={1}
          intensity={66}
          distance={30}
          color="deepskyblue"
          angle={Math.PI / 8}
          penumbra={0.5}
          decay={0.1}
          ref={refSpotLight}
        ></spotLight>

        <lightProbe ref={refLightProbe} color={'blue'} position={[0, 0, 3]} name={'myLightProbe'} />
      </group>

      <Box
        castShadow
        receiveShadow
        mapURL="textures/utils/checkerboard-8x8.png"
        position={[-1.2, customControlXY.x, customControlXY.y]}
        __inspectorData={{ isInspectable: true }}
        name="Box 1"
      />
      <Box
        mapURL="textures/utils/checkerboard-8x8.png"
        alphaMapURL="textures/utils/checkerboard-8x8.png"
        position={[1.2, 0, 0]}
        __inspectorData={{ isInspectable: true }}
        castShadow
        receiveShadow
        name="Box 2"
      >
        <mesh
          // receiveShadow
          position={[1.5, 0.5, 0]}
          __inspectorData={{ isInspectable: true }}
          name="Box 2 child"
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial />
        </mesh>
      </Box>
      <mesh
        name="plane"
        rotation={[-1.5, 0, 0]}
        position={[-5, -7.23, -3]}
        receiveShadow
        __inspectorData={{ isInspectable: true }}
      >
        <planeGeometry args={[32, 32]} />
        <meshStandardMaterial color="white" side={THREE.DoubleSide} />
        {/*<meshStandardMaterial*/}
        {/*  roughness={0}*/}
        {/*  metalness={1}*/}
        {/*  envMap={webGLCubeRenderTargetRef.current.texture}*/}
        {/*  color="white"*/}
        {/*  side={THREE.DoubleSide}*/}
        {/*/>*/}
      </mesh>

      <mesh
        name="shMapPlane"
        rotation={[-1.5, 0, 0]}
        position={[-15, -17.23, -3]}
        receiveShadow={false}
        castShadow={false}
        __inspectorData={{ isInspectable: true }}
        material={shadowMapMaterial}
      >
        <planeGeometry args={[32, 32]} />
        {/*<meshStandardMaterial side={THREE.DoubleSide} map={refDirectionalLight.current?.shadow?.map?.texture} />*/}
        {/*<meshStandardMaterial*/}
        {/*  roughness={0}*/}
        {/*  metalness={1}*/}
        {/*  envMap={webGLCubeRenderTargetRef.current.texture}*/}
        {/*  color="white"*/}
        {/*  side={THREE.DoubleSide}*/}
        {/*/>*/}
      </mesh>

      <mesh
        name="door"
        rotation={[0, 0, 0]}
        position={[0, 0, -2]}
        receiveShadow
        castShadow
        __inspectorData={{ isInspectable: true }}
      >
        <planeGeometry args={[16, 16]} />
        {/*@ts-ignore*/}
        <meshPhysicalMaterial ref={doorMaterialRef} side={THREE.DoubleSide} />
      </mesh>

      <positionalAudio args={[audioListenerRef.current]} position={[0, 0, 5]} />

      <perspectiveCamera
        args={[75, 1, 0.1, 100]} // window.innerWidth / window.innerHeight
        position={[-12.98, 3.963, 4.346]}
        name="myPerspectiveCamera"
        rotation={[degToRad(-42.342), degToRad(-65.604), degToRad(-39.706)]} // 25.86 , -46.13, 19.26
        __inspectorData={{ useOnPlay: true }}
      />

      {/*<orthographicCamera*/}
      {/*  args={[0, -0, 0, -0, 0.1, 10000]} // window.innerWidth / window.innerHeight*/}
      {/*  zoom={45}*/}
      {/*  position={[-12.98, 3.963, 4.346]}*/}
      {/*  name="myOrthographicCamera"*/}
      {/*  rotation={[degToRad(-42.342), degToRad(-65.604), degToRad(-39.706)]} // 25.86 , -46.13, 19.26*/}
      {/*  __inspectorData={{ useOnPlay: true }}*/}
      {/*/>*/}

      <cubeCamera
        ref={cubeCameraRef}
        name="myCubeCamera"
        args={[0.1, 1000, webGLCubeRenderTargetRef.current]}
        position={[0, 0, 8]}
      />

      <CustomControl
        name={'myBool'}
        object={customPropsRef.current}
        prop={'myBool'}
        control={{
          label: 'My Bool',
          onChange: (value: boolean) => {
            setShowOthers(value);
          }
        }}
      />
      <CustomControl
        name={'myBool_2'}
        object={customPropsRef.current}
        prop={'myBool'}
        control={{
          label: 'My Bool',
          onChange: (value: boolean) => {
            setShowOthers(value);
          }
        }}
      />
      {showOthers && (
        <>
          <CustomControl
            name={'SceneBG'}
            object={scene}
            prop={'background'}
            control={{
              label: 'Texture',
              gl,
              color: { type: 'float' },
              onChange: (...args: any[]) => {
                console.log('Experience reacting to SceneBG value change', args);
              }
            }}
          />
          <CustomControl
            name="myNumber"
            object={customPropsRef.current}
            prop={'myNumber'}
            control={{
              label: 'My Number',
              step: 0.01,
              keyScale: 0.1,
              pointerScale: 0.01,
              onChange: (value: number) => {
                customPropsRef.current.myPoint.x = value;
              }
            }}
          />
          <CustomControl
            name="myPoint"
            object={customPropsRef.current}
            prop={'myPoint'}
            control={{
              label: 'Point',
              step: 0.01,
              keyScale: 0.1,
              pointerScale: 0.01,
              onChange: (value: any) => {
                setCustomControlXY({ ...value });
                customPropsRef.current.myNumber = value.x;
              }
            }}
          />
        </>
      )}
    </>
  );
}

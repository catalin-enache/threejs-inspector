import * as THREE from 'three';
import { useEffect, useRef, useState } from 'react';
import { useFrame, ThreeElements, useThree } from '@react-three/fiber';
import { CustomControl } from 'components/CustomControl/CustomControl';
import { usePlay } from 'lib/hooks';
import { degToRad } from 'lib/utils';
import { loadImage } from 'lib/utils/imageUtils';

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
  usePlay((_state, _delta) => {
    refMesh.current.rotation.x += _delta;
    // refMesh.current.position.x = Math.sin(Date.now() / 1000);
    // refMesh?.current && (refMesh.current.position.z = 2);
  });

  useEffect(() => {
    // 'https://threejsfundamentals.org/threejs/resources/images/wall.jpg',
    // 'textures/file_example_TIFF_10MB.tiff',
    // 'textures/sample_5184×3456.tga',
    // 'textures/checkerboard-8x8.png',
    // 'textures/castle_brick_02_red_nor_gl_4k.exr',
    // 'textures/sikqyan_2K_Displacement.exr',
    loadImage(mapURL, meshMaterialRef).then((map) => {
      console.log('setting map');
      setMap(map);
    });
    alphaMapURL &&
      loadImage(alphaMapURL, meshMaterialRef).then((map) => {
        console.log('setting alphaMap');
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
      <meshStandardMaterial ref={meshMaterialRef} color={hovered ? 'hotpink' : 'white'} map={map} alphaMap={alphaMap} />
      {props.children}
    </mesh>
  );
}

export function Experience() {
  const { scene } = useThree();

  const refDirectionalLight = useRef<THREE.DirectionalLight>(null!);
  const refPointLight = useRef<THREE.PointLight>(null!);
  const doorMaterialRef = useRef<THREE.MeshStandardMaterial>(null!);
  useFrame((_state, _delta) => {
    if (refPointLight.current) {
      // refPointLight.current.intensity = Math.sin(Date.now() / 100) + 1;
    }
  });
  // const [myImage, setMyImage] = useState<any>(null);
  const [showOthers, setShowOthers] = useState(false);
  const [customControlXY, setCustomControlXY] = useState({ x: 0.5, y: 0.5 });
  const [number, setNumber] = useState(1.23);

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
    const promises = [
      'alpha.jpg',
      'ambientOcclusion.jpg',
      'color.jpg',
      'height.jpg',
      'metalness.jpg',
      'normal.jpg',
      'roughness.jpg'
    ].map((img) => loadImage(`textures/door/${img}`));
    Promise.all(promises).then((textures) => {
      console.log(doorMaterialRef.current, textures);
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
    // 'textures/file_example_TIFF_10MB.tiff',
    // 'textures/sample_5184×3456.tga',
    // 'textures/checkerboard-8x8.png',
    // 'textures/castle_brick_02_red_nor_gl_4k.exr',
    // 'textures/sikqyan_2K_Displacement.exr',
    // 'textures/castle_brick_02_red_diff_4k.jpg',
    // 'textures/cover-1920.jpg',
    loadImage('textures/cover-1920.jpg').then((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      scene.background = texture;
    });
  }, []);

  return (
    <>
      <directionalLight
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-radius={4}
        // shadow-bias={-0.001}
        shadow-blurSamples={8}
        castShadow
        position={[2, 2, 2]}
        scale={1}
        intensity={4.5}
        ref={refDirectionalLight}
        color={'white'}
        userData={{ isInspectable: false }}
      ></directionalLight>
      <hemisphereLight
        // args={[0xffffff, 0xffffff, 2]}
        intensity={2}
        color={new THREE.Color().setHSL(0.6, 1, 0.6)}
        groundColor={new THREE.Color().setHSL(0.095, 1, 0.75)}
      />
      <rectAreaLight color={'deepskyblue'} position={[-3, 0, -8]} rotation={[-2.51, 0, 0]} />
      <pointLight
        castShadow
        // shadow-mapSize={[2048, 2048]}
        position={[0, 0, 0]}
        color={'orange'}
        // decay={0}
        scale={1}
        intensity={Math.PI}
        ref={refPointLight}
        userData={{ isInspectable: false }}
      />

      <spotLight
        castShadow
        position={[5.5, -0.7, 0.3]}
        scale={1}
        intensity={5.5}
        distance={8}
        color="deepskyblue"
        angle={Math.PI / 8}
        penumbra={0.5}
      ></spotLight>

      <Box
        castShadow
        receiveShadow
        mapURL="textures/checkerboard-8x8.png"
        position={[-1.2, customControlXY.x, customControlXY.y]}
        userData={{ isInspectable: true }}
      />
      <Box
        mapURL="textures/checkerboard-8x8.png"
        alphaMapURL="textures/checkerboard-8x8.png"
        position={[1.2, 0, 0]}
        userData={{ isInspectable: true }}
        castShadow
        receiveShadow
      >
        <mesh
          // receiveShadow
          position={[1.5, 0.5, 0]}
          userData={{ isInspectable: true }}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial />
        </mesh>
      </Box>
      <mesh rotation={[-1.5, 0, 0]} position={[-5, -6, -3]} receiveShadow userData={{ isInspectable: true }}>
        <planeGeometry args={[16, 16]} />
        <meshStandardMaterial color="white" side={THREE.DoubleSide} />
      </mesh>

      <mesh name="door" rotation={[0, 0, 0]} position={[0, 0, -2]} receiveShadow userData={{ isInspectable: true }}>
        <planeGeometry args={[16, 16]} />
        <meshPhysicalMaterial ref={doorMaterialRef} side={THREE.DoubleSide} />
      </mesh>

      {/*<lightProbe color={'red'} />*/}

      <perspectiveCamera
        args={[75, 1, 0.1, 100]} // window.innerWidth / window.innerHeight
        position={[0, 0, 5]}
        rotation={[degToRad(25.86), degToRad(-46.13), degToRad(0)]} // 25.86 , -46.13, 19.26
        userData={{ useOnPlay: false }}
      />

      <axesHelper args={[10]} />

      {showOthers && scene.background && (
        <CustomControl
          name="myImage"
          value={scene.background}
          control={{
            label: 'Texture',
            view: 'texture',
            color: { type: 'float' }
          }}
          onChange={(value) => {
            console.log('Experience reacting to myImage value change', value?.constructor);
            scene.background = value;
          }}
        />
      )}

      <CustomControl
        name="myBool"
        value={showOthers}
        control={{ label: 'Show point' }}
        onChange={(value) => {
          setShowOthers(value);
        }}
      />

      <CustomControl
        name="myNumber"
        value={number}
        control={{
          label: 'My Number',
          step: 0.01,
          keyScale: 0.1,
          pointerScale: 0.01
        }}
        onChange={(value) => {
          // console.log('Experience reacting to myNumber value change', value);
          setNumber(value);
          setCustomControlXY({ x: value, y: customControlXY.y });
        }}
      />

      {showOthers && (
        <CustomControl
          name="myPoint"
          value={customControlXY}
          control={{
            label: 'Point',
            step: 0.01,
            keyScale: 0.1,
            pointerScale: 0.01
            // x: { step: 0.02 },
            // y: { step: 0.02 }
          }}
          onChange={(value) => {
            // console.log('Experience reacting to myPoint value change', value);
            setCustomControlXY(value);
            setNumber(value.x);
          }}
        />
      )}
    </>
  );
}

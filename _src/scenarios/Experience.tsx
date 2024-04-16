import * as THREE from 'three';
import { useEffect, useRef, useState } from 'react';
import { useFrame, ThreeElements, useThree } from '@react-three/fiber';
import { CustomControl } from 'components/CustomControl/CustomControl';
import { usePlay } from 'lib/hooks';
import { degToRad } from 'lib/utils';

function Box(props: ThreeElements['mesh']) {
  const refMesh = useRef<THREE.Mesh>(null!);
  const [hovered, _hover] = useState(false);
  const [clicked, _click] = useState(false);
  const { position = [0, 0, 0], ...rest } = props;
  usePlay((_state, _delta) => {
    refMesh.current.rotation.x += _delta;
    // refMesh.current.position.x = Math.sin(Date.now() / 1000);
    // refMesh?.current && (refMesh.current.position.z = 2);
  });

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
      <meshStandardMaterial color={hovered ? 'hotpink' : 'white'} />
      {props.children}
    </mesh>
  );
}

export function Experience() {
  const { scene } = useThree();

  const refDirectionalLight = useRef<THREE.DirectionalLight>(null!);
  const refPointLight = useRef<THREE.PointLight>(null!);
  useFrame((_state, _delta) => {
    if (refPointLight.current) {
      // refPointLight.current.intensity = Math.sin(Date.now() / 100) + 1;
    }
  });
  const [showPoint, setShowPoint] = useState(false);
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

  // console.log('Experience rendering', { number, customControlXY });

  useEffect(() => {
    new THREE.TextureLoader().load(
      'https://threejsfundamentals.org/threejs/resources/images/wall.jpg',
      (texture) => {
        // texture.wrapS = THREE.RepeatWrapping;
        // texture.wrapT = THREE.RepeatWrapping;
        // texture.repeat.set(2, 2);
        // texture.repeat.x = 1;
        // texture.offset.x = 0.5;
        // setTexture(texture);
        scene.background = texture;
        scene.backgroundIntensity = 0.05;
        scene.background = new THREE.Color('#000011');
      }
    );
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
      <rectAreaLight
        color={'deepskyblue'}
        position={[-3, 0, -8]}
        rotation={[-2.51, 0, 0]}
      />
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
        position={[-1.2, customControlXY.x, customControlXY.y]}
        userData={{ isInspectable: true }}
      />
      <Box
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
      <mesh
        rotation={[-1.5, 0, 0]}
        position={[-5, -6, -3]}
        receiveShadow
        userData={{ isInspectable: true }}
      >
        <planeGeometry args={[16, 16]} />
        <meshStandardMaterial color="white" side={THREE.DoubleSide} />
      </mesh>

      {/*<lightProbe color={'red'} />*/}

      <perspectiveCamera
        args={[75, 1, 0.1, 100]} // window.innerWidth / window.innerHeight
        position={[0, 0, 5]}
        rotation={[degToRad(25.86), degToRad(-46.13), degToRad(0)]} // 25.86 , -46.13, 19.26
        userData={{ useOnPlay: true }}
      />

      <axesHelper args={[10]} />

      <CustomControl
        name="myBool"
        value={showPoint}
        control={{ label: 'Show point' }}
        onChange={(value) => {
          setShowPoint(value);
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
        }} // view: 'counter'
        onChange={(value) => {
          // console.log('Experience reacting to myNumber value change', value);
          setNumber(value);
          setCustomControlXY({ x: value, y: customControlXY.y });
        }}
      />

      {showPoint && (
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

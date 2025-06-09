import * as THREE from 'three';
import { useEffect, useRef, memo, useState, ReactNode } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useStats } from 'lib/hooks';
import { api } from 'src';
import { CustomControl } from 'src/components/CustomControl/CustomControl';

const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(1024);
const cubeCamera = new THREE.CubeCamera(0.1, 1000, cubeRenderTarget);
const mirrorMaterial = new THREE.MeshStandardMaterial({
  envMap: cubeRenderTarget.texture,
  metalness: 1,
  roughness: 0
});
cubeCamera.position.set(0, -20, 0);

const platformDefaultMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color().setHSL(0.32, 0.6, 0.08),
  side: THREE.DoubleSide
});

const materialTypes = [
  'MeshBasicMaterial',
  'MeshStandardMaterial',
  'MeshLambertMaterial',
  'MeshPhongMaterial',
  'MeshPhysicalMaterial',
  'MeshToonMaterial',
  'MeshMatcapMaterial',
  'MeshNormalMaterial'
];

type MeshType = 'cube' | 'sphere' | 'plane';
const meshTypes: MeshType[] = ['cube', 'sphere', 'plane'];

const materialOptions = materialTypes.reduce(
  (acc, mat) => {
    acc[mat] = mat;
    return acc;
  },
  {} as Record<string, string>
);

const meshOptions = meshTypes.reduce(
  (acc, mat) => {
    acc[mat] = mat;
    return acc;
  },
  {} as Record<string, string>
);

type SceneBackgroundName = 'None' | 'SpruitSunrise' | 'MilkyWay' | 'Park3Med' | 'SkyboxSun' | 'Pisa';
const sceneBackgroundNames: SceneBackgroundName[] = [
  'None',
  'SpruitSunrise',
  'MilkyWay',
  'MilkyWay',
  'Park3Med',
  'SkyboxSun',
  'Pisa'
];

const sceneBackgroundOptions = sceneBackgroundNames.reduce(
  (acc, name) => {
    acc[name] = name;
    return acc;
  },
  {} as Record<string, string>
);

const minTessellation = 1;
const maxTessellation = 300;

export const MaterialTest = memo(function MaterialTest() {
  const { scene, camera } = useThree();
  useStats();
  useFrame(() => {
    api.updateCubeCamera(cubeCamera);
  });

  const materialsRef = useRef<Record<string, THREE.Material>>({});
  const sceneBackgroundsRef = useRef<Record<string, THREE.Texture>>({});
  const [sceneBackgroundName, setSceneBackgroundName] = useState<SceneBackgroundName>('None');

  const [showPlatform, setShowPlatform] = useState<boolean>(true);
  const [platformMaterial, setPlatformMaterial] = useState<'default' | 'mirror'>('default');
  const [currentMaterial, setCurrentMaterial] = useState<THREE.Material | null>(null);
  const [currentMeshType, setCurrentMeshType] = useState<MeshType>(meshTypes[1]);
  const [tessellation, setTessellation] = useState<number>(80);
  const showGizmosRef = useRef(true);

  const customPropsRef = useRef({
    currentMaterialType: materialTypes[1],
    currentMeshType,
    tessellation,
    showPlatform,
    platformMaterial,
    sceneBackgroundName: sceneBackgroundNames[0]
  });

  const initialized = !!currentMaterial;

  // initialize cameras
  useEffect(() => {
    camera.position.set(0, 0, 22);
    camera.rotation.set(0, 0, 0);
    if (camera instanceof THREE.OrthographicCamera) {
      camera.zoom = 30;
    }
  }, [camera]);

  // initialize scene and load scene background textures
  useEffect(() => {
    scene.add(cubeCamera);

    scene.background = new THREE.Color().setHex(0x000000);
    scene.environment = null;

    (async () => {
      const texturesSpruitSunrise = await api.createTexturesFromImages(
        'textures/background/equirectangular/spruit_sunrise_4k.hdr.jpg',
        {}
      );
      const texturesMilkyWay = await api.createTexturesFromImages(
        ['px', 'nx', 'py', 'ny', 'pz', 'nz'].map((t) => `textures/background/cube/MilkyWay/dark-s_${t}.jpg`),
        {}
      );
      const texturesPark3Med = await api.createTexturesFromImages(
        ['px', 'nx', 'py', 'ny', 'pz', 'nz'].map((t) => `textures/background/cube/Park3Med/${t}.jpg`),
        {}
      );
      const texturesSkyboxSun = await api.createTexturesFromImages(
        ['px', 'nx', 'py', 'ny', 'pz', 'nz'].map((t) => `textures/background/cube/skyboxsun25deg/${t}.jpg`),
        {}
      );
      const texturesPisa = await api.createTexturesFromImages(
        ['px', 'nx', 'py', 'ny', 'pz', 'nz'].map((t) => `textures/background/cube/pisa/${t}.png`),
        {}
      );

      const [SpruitSunrise, MilkyWay, Park3Med, SkyboxSun, Pisa] = [
        texturesSpruitSunrise,
        texturesMilkyWay,
        texturesPark3Med,
        texturesSkyboxSun,
        texturesPisa
      ].map((textures) => {
        const texture = textures[0];
        texture.mapping =
          texture instanceof THREE.CubeTexture
            ? THREE.CubeReflectionMapping // THREE.CubeReflectionMapping, THREE.CubeRefractionMapping
            : texture.image.width / texture.image.height === 2
              ? THREE.EquirectangularReflectionMapping
              : THREE.UVMapping;
        texture.needsUpdate = true;
        return texture;
      });

      sceneBackgroundsRef.current = {
        SpruitSunrise,
        MilkyWay,
        Park3Med,
        SkyboxSun,
        Pisa
      };
    })();

    api.setShowAxesHelper(false);
    api.setShowGridHelper(false);
    api.setShowGizmos(showGizmosRef.current);
    return () => {
      scene.background = new THREE.Color().setHex(0x000000);
      scene.environment = null;
    };
  }, [scene]);

  // update scene background based on selected option
  useEffect(() => {
    if (!sceneBackgroundName) return;
    if (sceneBackgroundsRef.current[sceneBackgroundName]) {
      scene.background = sceneBackgroundsRef.current[sceneBackgroundName];
      scene.environment = sceneBackgroundsRef.current[sceneBackgroundName];
      if (sceneBackgroundName === 'SpruitSunrise') {
        platformDefaultMaterial.color = new THREE.Color().setHSL(0.13, 0.61, 0.08);
      } else if (sceneBackgroundName === 'MilkyWay') {
        platformDefaultMaterial.color = new THREE.Color().setHSL(0.64, 0.61, 0.08);
      } else {
        platformDefaultMaterial.color = new THREE.Color().setHSL(0.0, 0.0, 0.07);
      }
    } else {
      scene.background = new THREE.Color().setHex(0x000000);
      scene.environment = null;
      platformDefaultMaterial.color = new THREE.Color().setHSL(0.0, 0.0, 0.07);
    }
  }, [scene, sceneBackgroundName]);

  // set current material on test object
  useEffect(() => {
    (async () => {
      const [map, displacementMap, normalMap, roughnessMap, aoMap] = await api.createTexturesFromImages(
        [
          'Rocks005_1K-JPG_Color',
          'Rocks005_1K-JPG_Displacement',
          'Rocks005_1K-JPG_NormalGL',
          'Rocks005_1K-JPG_Roughness',
          'Rocks005_1K-JPG_AmbientOcclusion'
        ].map((t) => `textures/ambientcg/Rocks005/${t}.jpg`),
        {}
      );
      const maps = {
        map,
        displacementMap,
        normalMap,
        roughnessMap,
        aoMap
      };
      materialTypes.forEach((type) => {
        if (!materialsRef.current[type]) {
          materialsRef.current[type] = api.getMaterialFromType(type, {});
          Object.keys(maps).forEach((prop) => {
            if (Object.hasOwn(materialsRef.current[type], prop)) {
              // @ts-ignore
              materialsRef.current[type][prop] = maps[prop];
              if (prop === 'displacementMap') {
                (materialsRef.current[type] as THREE.MeshStandardMaterial).displacementScale = 1;
              } else if (prop === 'aoMap') {
                (materialsRef.current[type] as THREE.MeshStandardMaterial).aoMapIntensity = 1;
              } else if (prop === 'roughnessMap') {
                (materialsRef.current[type] as THREE.MeshStandardMaterial).roughness = 1;
              }
            }
          });
          materialsRef.current[type].needsUpdate = true;
        }
      });
      setCurrentMaterial(materialsRef.current[customPropsRef.current.currentMaterialType]);
    })();
  }, []);

  useEffect(() => {
    // because R3F adds geometry asynchronously, after internal setup
    api.updateSceneBBox();
  }, [initialized]);

  if (!initialized) return null;

  const cube = (
    <mesh material={currentMaterial} castShadow receiveShadow __inspectorData={{ isInspectable: true }} name="cube">
      <boxGeometry args={[10, 10, 10, tessellation, tessellation, tessellation]} />
    </mesh>
  );

  const sphere = (
    <mesh material={currentMaterial} castShadow receiveShadow __inspectorData={{ isInspectable: true }} name="sphere">
      <sphereGeometry args={[10, tessellation, tessellation]} />
    </mesh>
  );

  const plane = (
    <mesh material={currentMaterial} castShadow receiveShadow __inspectorData={{ isInspectable: true }} name="plane">
      <planeGeometry args={[10, 10, tessellation, tessellation]} />
    </mesh>
  );

  const meshes: Record<MeshType, ReactNode> = {
    cube,
    sphere,
    plane
  };

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

      {meshes[currentMeshType]}

      <mesh
        name="platform"
        rotation={[-1.571, 0, 0]}
        position={[0, -20, 0]}
        receiveShadow
        material={platformMaterial === 'default' ? platformDefaultMaterial : mirrorMaterial}
        visible={showPlatform}
        __inspectorData={{ isInspectable: true }}
      >
        <boxGeometry args={[100, 100, 5]} />
      </mesh>

      <CustomControl
        name={'material'}
        object={customPropsRef.current}
        prop={'currentMaterialType'}
        control={{
          label: 'Current Material',
          options: materialOptions,
          onChange: (materialType) => {
            setCurrentMaterial(materialsRef.current[materialType]);
            api.refreshCPanel();
          }
        }}
      />
      <CustomControl
        name={'mesh'}
        object={customPropsRef.current}
        prop={'currentMeshType'}
        control={{
          label: 'Current Mesh',
          options: meshOptions,
          onChange: (meshType) => {
            setCurrentMeshType(meshType);
          }
        }}
      />
      <CustomControl
        name={'tessellation'}
        object={customPropsRef.current}
        prop={'tessellation'}
        control={{
          label: 'Tessellation',
          min: minTessellation,
          max: maxTessellation,
          step: 1,
          onChange: (tessellation) => {
            setTessellation(tessellation);
          }
        }}
      />
      {Object.hasOwn(currentMaterial, 'wireframe') && (
        <CustomControl
          key={currentMaterial.uuid}
          name={'wireframe'}
          object={currentMaterial}
          prop={'wireframe'}
          control={{
            label: 'Wireframe'
          }}
        />
      )}
      <CustomControl
        name={'showPlatform'}
        object={customPropsRef.current}
        prop={'showPlatform'}
        control={{
          label: 'Show Platform',
          onChange: setShowPlatform
        }}
      />
      <CustomControl
        name={'platformMaterial'}
        object={customPropsRef.current}
        prop={'platformMaterial'}
        control={{
          label: 'Platform Material',
          options: {
            default: 'default',
            mirror: 'mirror'
          },
          onChange: setPlatformMaterial
        }}
      />
      <CustomControl
        name={'sceneBackgroundName'}
        object={customPropsRef.current}
        prop={'sceneBackgroundName'}
        control={{
          label: 'Scene Background',
          options: sceneBackgroundOptions,
          onChange: setSceneBackgroundName
        }}
      />
      <CustomControl
        name={'showGizmos'}
        control={{
          label: 'Toggle Gizmos',
          title: 'Toggle Gizmos',
          onClick: () => {
            api.setShowGizmos(!showGizmosRef.current);
            showGizmosRef.current = !showGizmosRef.current;
          }
        }}
      />
    </>
  );
});

export default MaterialTest;

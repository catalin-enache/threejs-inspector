import * as THREE from 'three';
import { cloneObject3D } from './cloneObject3D';
import { BufferAttributeConstructor, TypedArrayConstructor } from 'src/types';
// import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
// @ts-ignore
import * as BufferGeometryUtils from 'lib/third_party/BufferGeometryUtils.js'; // fixed in my PR // TODO: revert to upstream after new release

// @ts-ignore
const _verifyIntegrity = (newMesh: THREE.Mesh, oldMesh: THREE.Mesh) => {
  const newGeometry = newMesh.geometry;
  const oldGeometry = oldMesh.geometry;

  for (const name in oldGeometry.attributes) {
    console.log('checking attributes', name);
    const oldAttribute = oldGeometry.attributes[name] as any;
    const newAttribute = newGeometry.attributes[name] as any;

    for (const property in oldAttribute) {
      if (property === 'array') continue;
      console.log('checking attributes', name, property);
      if (oldAttribute[property] !== newAttribute[property]) {
        console.log('oldAttribute[property] !== newAttribute[property]', {
          name,
          property,
          oldAttribute: oldAttribute[property],
          newAttribute: newAttribute[property]
        });
      }
    }

    for (let i = 0; i < oldAttribute.array.length; i++) {
      if (Math.round(oldAttribute.array[i] * 100_000) !== Math.round(newAttribute.array[i] * 100_000)) {
        console.log('oldAttribute.array[i] !== newAttribute.array[i]', {
          name,
          i,
          oldAttribute: oldAttribute.array[i],
          newAttribute: newAttribute.array[i]
        });
      }
    }
  }

  let count = 0;
  const oldIndices = oldGeometry.index!.array;
  const newIndices = newGeometry.index!.array;
  for (let i = 0; i < oldIndices.length; i++) {
    if (count > 100) break;
    if (oldIndices[i] !== newIndices[i]) {
      console.log('oldIndices[i] !== newIndices[i]', { i, oldIndex: oldIndices[i], newIndex: newIndices[i] });
      count += 1;
    }
  }
};

export const toIndexedGeometry = (mesh: THREE.Mesh, tolerance = 1e-4) => {
  if (!mesh.geometry.index) {
    const indexedGeometry = BufferGeometryUtils.mergeVertices(mesh.geometry, tolerance);
    putGeometryNamesBack(indexedGeometry, mesh.geometry);
    mesh.geometry = indexedGeometry;
    mesh.__inspectorData.geometryHasBeenIndexed = true;
  }
};

const putGeometryNamesBack = (newGeometry: THREE.BufferGeometry, oldGeometry: THREE.BufferGeometry) => {
  newGeometry.name = oldGeometry.name;
  Object.keys(oldGeometry.attributes).forEach((key) => {
    newGeometry.attributes[key].name = oldGeometry.attributes[key].name;
  });
  Object.keys(oldGeometry.morphAttributes).forEach((key) => {
    oldGeometry.morphAttributes[key].forEach((buffer, index) => {
      newGeometry.morphAttributes[key][index].name = buffer.name;
    });
  });
};

const createAndAddNewMesh = (
  mergedGeometry: THREE.BufferGeometry,
  oldMeshClone: THREE.Mesh,
  material: THREE.Material,
  materialIndex: number,
  newRoot: THREE.Object3D,
  oldRoot: THREE.Object3D,
  animationsMap: Map<THREE.AnimationClip, THREE.KeyframeTrack[]>,
  debug: boolean
) => {
  // if is root mesh then parent is null
  const meshParent = oldMeshClone.parent;
  if (!mergedGeometry.attributes.position) return;

  let mergedMesh: THREE.Mesh | THREE.SkinnedMesh;
  if (oldMeshClone instanceof THREE.SkinnedMesh) {
    mergedMesh = new THREE.SkinnedMesh(mergedGeometry, material);
    const newSkeleton = (oldMeshClone as THREE.SkinnedMesh).skeleton;
    // newSkeleton.calculateInverses(); // calculateInverses can only be called when skeleton is in bind pose
    newSkeleton.update();
    newSkeleton.computeBoneTexture();
    // (mergedMesh as THREE.SkinnedMesh).bind(newSkeleton);
    (mergedMesh as THREE.SkinnedMesh).bind(newSkeleton, (oldMeshClone as THREE.SkinnedMesh).bindMatrix);
    (mergedMesh as THREE.SkinnedMesh).normalizeSkinWeights();
  } else {
    mergedMesh = new THREE.Mesh(mergedGeometry, material);
  }

  mergedMesh.__inspectorData.isInspectable = oldMeshClone.__inspectorData.isInspectable;
  mergedMesh.__inspectorData.hitRedirect =
    oldMeshClone.__inspectorData.hitRedirect === oldRoot ? newRoot : oldMeshClone.__inspectorData.hitRedirect;
  mergedMesh.__inspectorData.isRecombined = true;

  mergedMesh.name = oldMeshClone.name + '_' + materialIndex;
  debug && console.log('adding mesh', { mergedMesh }, 'to', { meshParent }, 'oldMeshClone', { oldMeshClone });
  meshParent?.add(mergedMesh); // don't remove the old mesh yet, we'll remove it after we finish processing it
  mergedMesh.position.copy(oldMeshClone.position);
  mergedMesh.rotation.copy(oldMeshClone.rotation);
  mergedMesh.scale.copy(oldMeshClone.scale);
  mergedMesh.updateMatrix();
  mergedMesh.updateMatrixWorld(true);

  if (oldMeshClone.morphTargetInfluences) {
    mergedMesh.morphTargetInfluences = oldMeshClone.morphTargetInfluences;
  }
  // normally morphTargetInfluences implies morphTargetDictionary
  if (oldMeshClone.morphTargetDictionary) {
    mergedMesh.morphTargetDictionary = oldMeshClone.morphTargetDictionary;
  }

  // if (Object.keys(mergedMesh.geometry.morphAttributes).length) {
  //   mergedMesh.updateMorphTargets();
  //   // rebuilds morphTargetDictionary and morphTargetInfluences from existing geometry
  //   // Cannot use it for glTF importer because it is losing names for geometry.morphAttributes,
  //   // but fortunately it builds morphTargetDictionary before losing them.
  //   // Because of that we need to copy morphTargetDictionary and morphTargetInfluences from original mesh
  //   // and we can't use updateMorphTargets() because we will lose the names forever.
  //   // Because of that we also cannot clean up morphs that are all zeroes, because it won't match with morphTargetInfluences.
  // }

  mergedGeometry.computeBoundingBox();
  mergedGeometry.computeBoundingSphere();

  if (mergedMesh instanceof THREE.SkinnedMesh) {
    mergedMesh.computeBoundingBox();
    mergedMesh.computeBoundingSphere();
  }

  if (debug) {
    _verifyIntegrity(mergedMesh, oldMeshClone);
  }

  animationsMap.forEach((tracks, animationClip) => {
    tracks.forEach((track) => {
      const newTrack = track.clone();
      newTrack.name = track.name.replace(`${oldMeshClone.name}.`, `${mergedMesh.name}.`);
      animationClip.tracks.push(newTrack);
    });
  });
  return mergedMesh;
};

// TODO: test recombineMeshesByMaterial with a cube having 3 meshes and one material and see if they are recombined into one mesh. (We won't want that)
export function recombineMeshesByMaterial(root: THREE.Mesh | THREE.Group, { debug }: { debug?: string }) {
  // From what I've seen so far for a loaded fbx, the root is a Group having as children a Group and a few SkinnedMeshes.
  // The Group child has itself as only child the root Bone of the Skeleton of the one of the SkinnedMeshes.
  // Each SkinnedMesh has its own Skeleton but only one has the skeleton.bones[0] the same instance as the Group.children[0].
  // OneOfTheSkinnedMeshes.skeleton.bones[0] === GroupChild.children[0]
  // or in other words
  // OneOfTheSkinnedMeshes.skeleton.bones[0].parent === GroupChild.
  // The other SkinnedMeshes have their own Skeletons but their Bones are descendants from the main Skeleton Bones.
  // We may have a "hip" -> "hip" -> "hip" chain where just the top is the one animated and is the one found in Group descendants.
  // The descendant "hip" bones are moving just because they are descendants of the top "hip" bone which is the one animated.
  // TODO: we might have a mesh by itself, not inside a group
  // TODO: The Group children bones can have Mesh as children, make sure to reach and address them too. Check Cyborg Soldier (Rigged Character).
  // TODO: Android Soldier throws error.

  const newRoot = cloneObject3D(root) as THREE.Mesh | THREE.Group;

  let totalMeshesAdded = 0;
  let totalMeshesRemoved = 0;
  const parents = new Set();
  const animations: THREE.AnimationClip[] = newRoot.animations;

  debug && console.log('recombineMeshes start', { root, newRoot });
  // @ts-ignore

  const visitedMeshes = new Set<THREE.Mesh>();

  newRoot.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return;
    }
    const oldMeshClone = child;
    const DEBUG = (debug && oldMeshClone.name === debug) || debug === 'ALL';

    visitedMeshes.add(oldMeshClone);

    const animationsMap = new Map<THREE.AnimationClip, THREE.KeyframeTrack[]>();
    animations.forEach((animationClip) => {
      const relatedTracks = animationClip.tracks.filter((track) => track.name.startsWith(`${oldMeshClone.name}.`));
      if (relatedTracks.length) {
        animationsMap.set(animationClip, relatedTracks);
      }
    });

    const meshMaterials: THREE.Material[] = Array.isArray(oldMeshClone.material)
      ? oldMeshClone.material
      : [oldMeshClone.material];

    let geometryClone: THREE.BufferGeometry = oldMeshClone.geometry.clone();

    DEBUG && console.log('oldMeshClone', { oldMeshClone, animationsMap, geometryClone });

    if (!geometryClone.groups?.length) {
      DEBUG && console.log('mesh.geometry does not have groups');
    } else {
      DEBUG && console.log('mesh.geometry has groups');
    }
    if (!geometryClone.index) {
      DEBUG && console.log('mesh.geometry does not have index');
    } else {
      DEBUG && console.log('mesh.geometry has index');
    }

    // Some geometries have no groups, so we create a default one taking the count from index if it exists else from positions.count
    const groups = geometryClone.groups?.length
      ? geometryClone.groups
      : [{ start: 0, count: geometryClone.index?.count ?? geometryClone.attributes.position.count, materialIndex: 0 }];

    const oldMeshParent = oldMeshClone.parent;
    oldMeshParent && parents.add(oldMeshParent);
    // morphAttributes: position, normal, ...
    meshMaterials.forEach((material: THREE.Material, materialIndex: number) => {
      DEBUG && console.log('material', { material, materialIndex, geometryClone });
      if (!geometryClone.index) {
        const mergedGeometry = new THREE.BufferGeometry();
        const attributesKeys = Object.keys(geometryClone.attributes);
        const mergedAttributes: any = attributesKeys.reduce((acc, key) => {
          acc[key] = [];
          return acc;
        }, {} as any);

        let morphAttributesKeys: string[] | undefined;
        let mergedMorphAttributes: any;
        if (geometryClone.morphAttributes) {
          morphAttributesKeys = Object.keys(geometryClone.morphAttributes);
          morphAttributesKeys.forEach((key) => {
            // key is 'position', 'normal', 'color', ...
            mergedMorphAttributes = mergedMorphAttributes || {};
            mergedMorphAttributes[key] = {};
            geometryClone.morphAttributes[key].forEach((buffer) => {
              mergedMorphAttributes[key][buffer.name] = [];
            });
          });
        }

        groups.forEach((group) => {
          if (group.materialIndex !== materialIndex) return;

          attributesKeys.forEach((attr) => {
            const oldAttribute = geometryClone.attributes[attr];
            const slice = oldAttribute.array.slice(
              group.start * oldAttribute.itemSize,
              (group.start + group.count) * oldAttribute.itemSize
            );

            slice.forEach((value) => {
              mergedAttributes[attr].push(value);
            });
          });

          morphAttributesKeys?.forEach((key) => {
            geometryClone.morphAttributes[key].forEach((buffer) => {
              const slice = buffer.array.slice(
                group.start * buffer.itemSize,
                (group.start + group.count) * buffer.itemSize
              );
              slice.forEach((value) => {
                mergedMorphAttributes[key][buffer.name].push(value);
              });
            });
          });
        });

        DEBUG && console.log('mergedAttributes', { mergedAttributes, mergedMorphAttributes });
        Object.keys(mergedAttributes).forEach((key) => {
          if (mergedAttributes[key].length > 0) {
            const oldAttribute = geometryClone.attributes[key];
            const itemSize = oldAttribute.itemSize;
            const normalized = oldAttribute.normalized;
            // @ts-ignore
            const gpuType = oldAttribute.gpuType;
            const ArrayConstructor = oldAttribute.array.constructor as TypedArrayConstructor;
            const BufferConstructor = oldAttribute.constructor as BufferAttributeConstructor;

            mergedGeometry.setAttribute(
              key,
              new BufferConstructor(new ArrayConstructor(mergedAttributes[key]), itemSize, normalized)
            );

            // @ts-ignore
            mergedGeometry.attributes[key].gpuType = gpuType;
          } else {
            DEBUG && console.log('no attribute', { key, material, mergedAttributes });
          }
        });

        mergedMorphAttributes &&
          Object.keys(mergedMorphAttributes).forEach((morphKey) => {
            const morphAttributes = mergedMorphAttributes[morphKey]; // e.g. position: [array, array]
            const oldMorphAttributeSample = geometryClone.morphAttributes[morphKey][0];
            const itemSize = oldMorphAttributeSample.itemSize;
            const normalized = oldMorphAttributeSample.normalized;
            // TODO: check how to handle THREE.InterleavedBufferAttribute
            // @ts-ignore
            const gpuType = oldMorphAttributeSample.gpuType;
            const ArrayConstructor = oldMorphAttributeSample.array.constructor as TypedArrayConstructor;
            const BufferConstructor = oldMorphAttributeSample.constructor as BufferAttributeConstructor;

            const morphBuffers = Object.keys(morphAttributes).map((name) => {
              // name: smile, frown, ...
              const morphData: number[] = morphAttributes[name];
              // If BufferConstructor is BufferAttribute class, it only accepts typed arrays
              const morphGeoBuffer = new BufferConstructor(new ArrayConstructor(morphData), itemSize, normalized);
              morphGeoBuffer.name = name;
              morphGeoBuffer.gpuType = gpuType;
              return morphGeoBuffer;
            });

            // morphBuffers: position: [Buffer, Buffer]
            if (morphBuffers.length === 0) return;
            mergedGeometry.morphAttributes[morphKey] = morphBuffers;
          });

        mergedGeometry.morphTargetsRelative = geometryClone.morphTargetsRelative;
        mergedGeometry.name = `${geometryClone.name}_${materialIndex}`;

        DEBUG && console.log('mergedGeometry', { mergedGeometry });

        createAndAddNewMesh(mergedGeometry, oldMeshClone, material, materialIndex, newRoot, root, animationsMap, DEBUG);
      } else {
        const mergedGeometry = new THREE.BufferGeometry();
        const attributesKeys = Object.keys(geometryClone.attributes);

        let morphAttributesKeys: string[] | undefined = undefined;
        if (geometryClone.morphAttributes) {
          morphAttributesKeys = Object.keys(geometryClone.morphAttributes);
        }

        // Map(5) { 0 => 0, 1 => 1, 4 => 2, 2 => 3, 3 => 4 }
        const indicesMapper = new Map();
        // [0, 1, 2, 1, 3, 2, 3, 4, 2, 4, 0, 2];
        const remappedIndices: number[] = [];

        groups.forEach((group) => {
          if (group.materialIndex !== materialIndex) return;
          // [0, 1, 4, 1, 2, 4, 2, 3, 4, 3, 0, 4];
          const indicesSlice: THREE.TypedArray = geometryClone.index!.array.slice(
            group.start,
            group.start + group.count
          );

          indicesSlice.forEach((idx) => {
            if (!indicesMapper.has(idx)) {
              indicesMapper.set(idx, indicesMapper.size); // every new index gets next slot
            }
            remappedIndices.push(indicesMapper.get(idx));
          });
          DEBUG && console.log('indicesSlice', { indicesSlice, group, vertexMap: indicesMapper });
        });

        attributesKeys.forEach((key) => {
          const oldAttribute = geometryClone.attributes[key];
          const oldBuffer = oldAttribute.array;
          const itemSize = oldAttribute.itemSize;
          const normalized = oldAttribute.normalized;
          // @ts-ignore
          const gpuType = oldAttribute.gpuType;
          const BufferConstructor = oldAttribute.constructor as BufferAttributeConstructor;
          const ArrayConstructor = oldBuffer.constructor as TypedArrayConstructor;
          const compactedBuffer = new ArrayConstructor(indicesMapper.size * itemSize);

          DEBUG &&
            console.log('compactedBuffer', {
              vertexMap: indicesMapper,
              key,
              itemSize,
              oldBuffer,
              compactedBuffer,
              BufferConstructor,
              ArrayConstructor
            });

          indicesMapper.forEach((remappedIndex, originalIndex) => {
            // collecting vertices from buffer into compactedBuffer
            for (let i = 0; i < itemSize; i++) {
              compactedBuffer[remappedIndex * itemSize + i] = oldBuffer[originalIndex * itemSize + i];
            }
          });

          mergedGeometry.setAttribute(key, new BufferConstructor(compactedBuffer, itemSize, normalized));
          // @ts-ignore
          mergedGeometry.attributes[key].gpuType = gpuType;
        });
        // mapping compactedBuffer with remappedIndices
        mergedGeometry.setIndex(new THREE.Uint32BufferAttribute(new Uint32Array(remappedIndices), 1));

        morphAttributesKeys?.forEach((morphKey) => {
          const oldMorphAttributeSample = geometryClone.morphAttributes[morphKey][0];
          const oldBuffer = oldMorphAttributeSample.array;
          const itemSize = oldMorphAttributeSample.itemSize;
          const normalized = oldMorphAttributeSample.normalized;
          // @ts-ignore
          const gpuType = oldMorphAttributeSample.gpuType;
          const BufferConstructor = oldMorphAttributeSample.constructor as BufferAttributeConstructor;
          const ArrayConstructor = oldBuffer.constructor as TypedArrayConstructor;

          const morphBuffers = geometryClone.morphAttributes[morphKey].map((morphAttribute) => {
            const name = morphAttribute.name;
            const morphData = morphAttribute.array;
            const compactedBuffer = new ArrayConstructor(indicesMapper.size * itemSize);

            indicesMapper.forEach((remappedIndex, originalIndex) => {
              for (let i = 0; i < itemSize; i++) {
                compactedBuffer[remappedIndex * itemSize + i] = morphData[originalIndex * itemSize + i];
              }
            });

            const morphGeoBuffer = new BufferConstructor(compactedBuffer, itemSize, normalized);
            morphGeoBuffer.name = name;
            morphGeoBuffer.gpuType = gpuType;
            return morphGeoBuffer;
          });

          // morphBuffers: position: [Buffer, Buffer]
          if (morphBuffers.length === 0) return;
          mergedGeometry.morphAttributes[morphKey] = morphBuffers;
        });

        mergedGeometry.morphTargetsRelative = geometryClone.morphTargetsRelative;
        mergedGeometry.name = `${geometryClone.name}_${materialIndex}`;

        DEBUG && console.log('mergedGeometry', { mergedGeometry });

        createAndAddNewMesh(mergedGeometry, oldMeshClone, material, materialIndex, newRoot, root, animationsMap, DEBUG);
      }
    });

    // remove original animations
    animationsMap.forEach((tracks, animationClip) => {
      animationClip.tracks = animationClip.tracks.filter((track) => !tracks.includes(track));
      tracks.forEach((track) => {
        const index = animationClip.tracks.indexOf(track);
        animationClip.tracks.splice(index, 1);
      });
    });
  });

  visitedMeshes.forEach((mesh) => {
    if (parents.has(mesh)) {
      // TODO: make a test for this case
      console.log('removing mesh that is also a parent', { mesh }, 'from', { meshParent: mesh.parent });
      // should not happen
    }
    mesh.removeFromParent();
    mesh.geometry.dispose();
    debug && console.log('removing mesh', { mesh }, 'from', { meshParent: mesh.parent });
    totalMeshesRemoved++;
  });

  debug && console.log('object has been rebuilt', { newRoot, root, totalMeshesAdded, totalMeshesRemoved, parents });
  newRoot.__inspectorData.isRecombined = true;
  newRoot.__inspectorData.animations = newRoot.animations;

  return newRoot;
}

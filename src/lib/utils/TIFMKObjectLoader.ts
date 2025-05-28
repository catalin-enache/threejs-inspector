import * as THREE from 'three';
import { getExtension } from 'lib/utils/fileUtils';
import type { RenderTargetAsJson } from 'src/tsExtensions';
import { InstancedBufferGeometry } from 'three/src/core/InstancedBufferGeometry';
import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { Material } from 'three/src/materials/Material';
import { AnimationClip } from 'three/src/animation/AnimationClip';

export class TIFMKObjectLoader extends THREE.ObjectLoader {
  constructor(public manager: THREE.LoadingManager) {
    super(manager);
  }

  getFileLoader() {
    const fileLoader = new THREE.FileLoader(this.manager);
    fileLoader.setPath(this.path);
    fileLoader.setRequestHeader(this.requestHeader);
    fileLoader.setWithCredentials(this.withCredentials);
    return fileLoader;
  }

  async loadAsync(url: string, onProgress?: (event: ProgressEvent) => void): Promise<THREE.Object3D> {
    const { BSON, EJSON } = await import('bson');

    const scope = this;
    const path = this.path === '' ? THREE.LoaderUtils.extractUrlBase(url) : this.path;
    this.resourcePath = this.resourcePath || path;
    const extension = getExtension(url);

    const loader = this.getFileLoader();
    extension === 'bson'
      ? loader.setResponseType('arraybuffer')
      : extension === 'json'
        ? loader.setResponseType('json')
        : null; // data will be text to be parsed by EJSON.parse

    const data = await loader.loadAsync(url, onProgress);

    const json =
      extension === 'bson'
        ? BSON.deserialize(data as Uint8Array) // data is binary due to  loader.setResponseType('arraybuffer')
        : extension === 'ejson'
          ? EJSON.parse(data as string)
          : data; // data is already JSON due to loader.setResponseType('json')

    const metadata = json.metadata;

    if (metadata === undefined || metadata.type === undefined || metadata.type.toLowerCase() === 'geometry') {
      throw new Error("TIFMKObjectLoader: Can't load " + url);
    }

    return await scope.parseAsync(json);
  }

  // @ts-ignore
  parseObject(
    data: any,
    geometries: { [key: string]: InstancedBufferGeometry | BufferGeometry },
    materials: { [key: string]: Material },
    textures: { [key: string]: THREE.Texture },
    animations: { [key: string]: AnimationClip }
  ) {
    if (data.type === 'CubeCamera') {
      const renderTargetStruct = data.renderTarget as RenderTargetAsJson;
      const depthTexture =
        renderTargetStruct.options.depthTexture &&
        new THREE.DepthTexture(
          renderTargetStruct.options.depthTexture.imageWidth,
          renderTargetStruct.options.depthTexture.imageHeight,
          renderTargetStruct.options.depthTexture.type,
          renderTargetStruct.options.depthTexture.mapping as THREE.Mapping,
          renderTargetStruct.options.depthTexture.wrap[0] as THREE.Wrapping,
          renderTargetStruct.options.depthTexture.wrap[1] as THREE.Wrapping,
          renderTargetStruct.options.depthTexture.magFilter,
          renderTargetStruct.options.depthTexture.minFilter,
          renderTargetStruct.options.depthTexture.anisotropy,
          renderTargetStruct.options.depthTexture.format as THREE.DepthTexturePixelFormat
        );
      const renderTarget = new THREE.WebGLCubeRenderTarget(renderTargetStruct.width, {
        ...renderTargetStruct.options,
        count: 1, // needs to be one, else is buggy (would create 1 CubeTexture and 5 Textures)
        depthTexture
      });

      const object = new THREE.CubeCamera(data.near, data.far, renderTarget);

      object.name = data.name;
      object.userData = data.userData || {};

      if (data.matrix !== undefined) {
        object.matrix.fromArray(data.matrix);

        if (data.matrixAutoUpdate !== undefined) object.matrixAutoUpdate = data.matrixAutoUpdate;
        if (object.matrixAutoUpdate) object.matrix.decompose(object.position, object.quaternion, object.scale);
      }

      return object;
    }

    return super.parseObject(data, geometries, materials, textures, animations);
  }
}

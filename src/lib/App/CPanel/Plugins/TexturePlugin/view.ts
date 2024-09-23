import { ViewProps, View, ClassName } from '@tweakpane/core';
import * as THREE from 'three';
import './texturePlugin.css';
import { getWidthHeightFromTexture, thumbnailMaterial } from 'lib/utils/imageUtils';
import { offlineScene } from 'lib/App/CPanel/offlineScene';

const offlineCanvasSize = 512;

const offlineOrthographicCamera = new THREE.OrthographicCamera(
  offlineCanvasSize / -2,
  offlineCanvasSize / 2,
  offlineCanvasSize / 2,
  offlineCanvasSize / -2
);

offlineOrthographicCamera.near = 0.0001;
offlineOrthographicCamera.far = 2;
offlineOrthographicCamera.position.z = 1;
offlineOrthographicCamera.zoom = 1;
offlineOrthographicCamera.updateProjectionMatrix();
const offlineRenderer = new THREE.WebGLRenderer();
offlineRenderer.setSize(offlineCanvasSize, offlineCanvasSize);

let debugID = 1;
const className = ClassName('texture');

export interface TextureViewConfig {
  viewProps: ViewProps;
  extensions: string[];
}

export const cacheMeshMap = new Map<string, { mesh: THREE.Mesh; mapTexture: THREE.Texture }>();

export class TextureView implements View {
  public readonly element: HTMLElement;
  public readonly input: HTMLElement;
  public readonly canvas: HTMLCanvasElement;
  public readonly ctx: CanvasRenderingContext2D;
  public debugID = debugID++;

  constructor(doc: Document, config: TextureViewConfig) {
    this.element = doc.createElement('div');
    this.element.classList.add(className());
    this.element.classList.add('texturePlugin');
    config.viewProps.bindClassModifiers(this.element);

    this.input = doc.createElement('input');
    this.input.setAttribute('multiple', 'multiple');
    this.input.classList.add(className('input'));
    this.input.classList.add('texturePlugin_input');
    this.input.setAttribute('type', 'file');
    this.input.setAttribute('accept', config.extensions.join(','));
    this.element.appendChild(this.input);

    this.canvas = doc.createElement('canvas');
    this.canvas.width = offlineCanvasSize;
    this.canvas.height = offlineCanvasSize;
    this.ctx = this.canvas.getContext('2d')!;
    this.canvas.classList.add(className('canvas'));
    this.canvas.classList.add('texturePlugin_canvas');
    this.element.appendChild(this.canvas);
    // prettier-ignore
    // console.log('TextureView constructor done', { canvasSize, ctx: this.ctx, config, this: this });
  }

  private makeMeshFromTexture(texture: THREE.Texture) {
    if (cacheMeshMap.has(texture.uuid)) {
      const { mesh, mapTexture } = cacheMeshMap.get(texture.uuid)!;
      thumbnailMaterial.uniforms.map.value = mapTexture;
      return mesh;
    }
    const { width, height } = getWidthHeightFromTexture(texture);
    const isCubeTexture = texture instanceof THREE.CubeTexture;
    const ratio = height / width;
    const geometry = new THREE.PlaneGeometry(offlineCanvasSize, offlineCanvasSize * ratio);
    // @ts-ignore
    const hdrJpgMaterial = texture.__hdrJpgMaterial; // handling HDRJPGLoader
    const mapTexture = !isCubeTexture
      ? texture
      : texture.images[0] instanceof THREE.DataTexture
        ? texture.images[0] // if CubeTexture already contains Textures get the first one
        : texture.images[0].src
          ? new THREE.Texture(texture.images[0]) // else make a new Texture from the first image if it has src
          : new THREE.DataTexture(new Uint8Array(4 * 8 * 8), 8, 8); // fallback texture

    thumbnailMaterial.uniforms.map.value = mapTexture;

    mapTexture.needsUpdate = true;
    const material = hdrJpgMaterial || thumbnailMaterial;
    const newMesh = new THREE.Mesh(geometry, material);
    newMesh.name = `TexturePluginMesh for texture ${texture.uuid}`;
    // cleanupAfterRemovedObject will dispose the geometry and material, but we prevent that here
    newMesh.__inspectorData.preventDestroy = true;
    // caching the mesh since it seems it takes long to create it and influences CPanel re-rendering
    // when certain things change (things that trigger CPanel re-construction like rad/deg rotation, TMode, TSpace, ...)
    cacheMeshMap.set(texture.uuid, { mesh: newMesh, mapTexture });
    return newMesh;
  }

  changeImage(texture: THREE.Texture) {
    const mesh = this.makeMeshFromTexture(texture);
    offlineScene.add(mesh);
    offlineRenderer.render(offlineScene, offlineOrthographicCamera);
    // const snapshot = renderer.domElement.toDataURL(); // take a snapshot of the offline canvas
    this.ctx.drawImage(offlineRenderer.domElement, 0, 0);
    // Note: even if we would not remove it, it will be removed by the next add.
    // In Three when something is added, it is first removed from parent.
    offlineScene.remove(mesh);
    // we dispose everything in cacheMeshMap in controller when no current object is selected
  }

  setIsLoading(isLoading: boolean) {
    isLoading
      ? this.element.classList.add('texturePlugin--isLoading')
      : this.element.classList.remove('texturePlugin--isLoading');
  }
}

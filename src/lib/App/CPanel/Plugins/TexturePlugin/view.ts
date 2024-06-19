import { ViewProps, View, ClassName } from '@tweakpane/core';
import * as THREE from 'three';
import './texturePlugin.css';
import { getWidthHeightFromTexture, thumbnailMaterial } from 'lib/utils/imageUtils';

export const canvasSize = 512;

const offlineScene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(canvasSize / -2, canvasSize / 2, canvasSize / 2, canvasSize / -2);

camera.near = 0.0001;
camera.far = 2;
camera.position.z = 1;
camera.zoom = 1;
camera.updateProjectionMatrix();
const offlineRenderer = new THREE.WebGLRenderer();
offlineRenderer.setSize(canvasSize, canvasSize);

let debugID = 1;
const className = ClassName('texture');

export interface TextureViewConfig {
  viewProps: ViewProps;
  extensions: string[];
}

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
    this.canvas.width = canvasSize;
    this.canvas.height = canvasSize;
    this.ctx = this.canvas.getContext('2d')!;
    this.canvas.classList.add(className('canvas'));
    this.canvas.classList.add('texturePlugin_canvas');
    this.element.appendChild(this.canvas);
    // prettier-ignore
    // console.log('TextureView constructor done', { canvasSize, ctx: this.ctx, config, this: this });
  }

  private makeMeshFromTexture(texture: THREE.Texture) {
    const { width, height } = getWidthHeightFromTexture(texture);
    const isCubeTexture = texture instanceof THREE.CubeTexture;
    const ratio = height / width;
    const geometry = new THREE.PlaneGeometry(canvasSize, canvasSize * ratio);
    // @ts-ignore
    const hdrJpgMaterial = texture.__hdrJpgMaterial; // handling HDRJPGLoader
    const mapTexture = !isCubeTexture
      ? texture
      : texture.images[0] instanceof THREE.DataTexture
        ? texture.images[0] // if CubeTexture already contains Textures get the first one
        : texture.images[0].src
          ? new THREE.Texture(texture.images[0]) // else make a new Texture from the first image if it has src
          : new THREE.DataTexture(new Uint8Array(4 * 16 * 16), 16, 16); // fallback texture

    thumbnailMaterial.uniforms.map.value = mapTexture;

    mapTexture.needsUpdate = true;
    const material = hdrJpgMaterial || thumbnailMaterial;
    const newMesh = new THREE.Mesh(geometry, material);
    newMesh.name = 'TexturePluginMesh';
    return newMesh;
  }

  changeImage(texture: THREE.Texture) {
    const mesh = this.makeMeshFromTexture(texture);
    offlineScene.add(mesh);
    offlineRenderer.render(offlineScene, camera);
    // const snapshot = renderer.domElement.toDataURL(); // take a snapshot of the offline canvas
    this.ctx.drawImage(offlineRenderer.domElement, 0, 0);
    offlineScene.remove(mesh);
    mesh.geometry.dispose();
    mesh.material.map?.dispose();
    mesh.material.dispose();
  }

  setIsLoading(isLoading: boolean) {
    isLoading
      ? this.element.classList.add('texturePlugin--isLoading')
      : this.element.classList.remove('texturePlugin--isLoading');
  }
}

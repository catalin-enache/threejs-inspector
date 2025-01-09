import { ViewProps, View, ClassName } from '@tweakpane/core';
import * as THREE from 'three';
import './texturePlugin.css';
import { getWidthHeightFromTexture } from 'lib/utils/imageUtils';
import { extractCubeTextureFromGPU, extractTextureFromGPU, getFallbackTexture } from 'lib/utils/textureUtils';
import { thumbnailMaterial, shadowMapMaterial } from 'lib/utils/customShaders';
import { offlineScene } from 'lib/App/CPanel/offlineScene';

const offlineOrthographicCamera = new THREE.OrthographicCamera();

offlineOrthographicCamera.near = 0.0001;
offlineOrthographicCamera.far = 2;
offlineOrthographicCamera.position.z = 1;
offlineOrthographicCamera.zoom = 1;

let debugID = 1;
const className = ClassName('texture');

export interface TextureViewConfig {
  viewProps: ViewProps;
  extensions: string[];
  gl: THREE.WebGLRenderer;
  isShadowMap: boolean;
  renderTarget?: THREE.WebGLRenderTarget | THREE.WebGLCubeRenderTarget;
  extractOneTextureAtIndex?: number;
  cubeTextureRenderLayout?: 'cross' | 'equirectangular';
  canvasWidth?: number;
}

export const cacheMeshMap = new Map<string, { mesh: THREE.Mesh; mapTexture: THREE.Texture; ratio: number }>();

export class TextureView implements View {
  public readonly element: HTMLElement;
  public readonly input: HTMLElement;
  public readonly select: HTMLSelectElement;
  public readonly canvas: HTMLCanvasElement;
  public readonly ctx: CanvasRenderingContext2D;
  public debugID = debugID++;
  public gl: THREE.WebGLRenderer;
  public isShadowMap: boolean;
  public renderTarget?: THREE.WebGLRenderTarget | THREE.WebGLCubeRenderTarget;
  public disabled: boolean = false;
  public extractOneTextureAtIndex?: number;
  public cubeTextureRenderLayout?: 'cross' | 'equirectangular';
  public canvasWidth?: number;

  // TextureView#constructor is called for each texture
  constructor(doc: Document, config: TextureViewConfig) {
    this.element = doc.createElement('div');
    this.element.classList.add(className());
    this.element.classList.add('texturePlugin');
    config.viewProps.bindClassModifiers(this.element);
    this.gl = config.gl;
    this.isShadowMap = config.isShadowMap;
    this.renderTarget = config.renderTarget;
    this.disabled = config.viewProps.get('disabled');
    this.extractOneTextureAtIndex = config.extractOneTextureAtIndex;
    this.cubeTextureRenderLayout = config.cubeTextureRenderLayout; // used in controller
    this.canvasWidth = config.canvasWidth || 512;

    offlineOrthographicCamera.left = this.canvasWidth / -2;
    offlineOrthographicCamera.right = this.canvasWidth / 2;
    offlineOrthographicCamera.top = this.canvasWidth / 2;
    offlineOrthographicCamera.bottom = this.canvasWidth / -2;
    offlineOrthographicCamera.updateProjectionMatrix();

    this.input = doc.createElement('input');
    this.input.setAttribute('multiple', 'multiple');
    this.input.classList.add(className('input'));
    this.input.classList.add('texturePlugin_input');
    this.input.setAttribute('type', 'file');
    this.input.setAttribute('accept', config.extensions.join(','));
    this.element.appendChild(this.input);

    this.canvas = doc.createElement('canvas');
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasWidth; // square canvas by default
    this.ctx = this.canvas.getContext('2d')!;
    this.canvas.classList.add(className('canvas'));
    this.canvas.classList.add('texturePlugin_canvas');
    this.element.appendChild(this.canvas);

    this.select = doc.createElement('select');
    this.select.classList.add(className('select'));
    this.select.classList.add('texturePlugin_select');

    const optionCross = this.select.appendChild(doc.createElement('option'));
    optionCross.value = 'cross';
    optionCross.textContent = 'Cross';
    const optionEquirectangular = this.select.appendChild(doc.createElement('option'));
    optionEquirectangular.value = 'equirectangular';
    optionEquirectangular.textContent = 'Equirectangular';
    this.select.value = config.cubeTextureRenderLayout || 'cross';
    if (config.cubeTextureRenderLayout) {
      this.element.appendChild(this.select);
    }

    // prettier-ignore
    // console.log('TextureView constructor done', { viewProps: config.viewProps });
  }

  private makeMeshFromTexture(texture: THREE.Texture) {
    if (cacheMeshMap.has(texture.uuid)) {
      // console.log('TextureView makeMeshFromTexture cache hit', { texture });
      const { mesh, mapTexture, ratio } = cacheMeshMap.get(texture.uuid)!;
      thumbnailMaterial.uniforms.map.value = mapTexture;
      shadowMapMaterial.uniforms.tDiffuse.value = mapTexture;
      shadowMapMaterial.uniformsNeedUpdate = true;
      return { mesh, ratio };
    }
    // console.log('TextureView makeMeshFromTexture cache miss', { texture });
    // @ts-ignore
    const idx = 0;
    const isCubeTexture = texture instanceof THREE.CubeTexture;
    const mapTexture = !isCubeTexture
      ? texture
      : texture.images[idx] instanceof THREE.DataTexture
        ? texture.images[idx] // if CubeTexture already contains Textures get the idx one
        : texture.images[idx].src
          ? new THREE.Texture(texture.images[idx]) // else make a new Texture from the first image if it has src
          : this.renderTarget && this.extractOneTextureAtIndex !== undefined
            ? extractTextureFromGPU({
                renderTarget: this.renderTarget,
                renderer: this.gl,
                imgObj: texture.images[this.extractOneTextureAtIndex], // could be 0, 1, 2, 3, 4, 5
                i: this.extractOneTextureAtIndex
              }).texture
            : this.renderTarget
              ? extractCubeTextureFromGPU({
                  renderTarget: this.renderTarget,
                  renderer: this.gl,
                  images: texture.images,
                  layout: this.select.value as 'cross' | 'equirectangular'
                })
              : getFallbackTexture().texture; // ratio: 4:3 (cross) or 2:1 (equirectangular)

    mapTexture.needsUpdate = true;
    thumbnailMaterial.uniforms.map.value = mapTexture;
    shadowMapMaterial.uniforms.tDiffuse.value = mapTexture;
    shadowMapMaterial.uniformsNeedUpdate = true;

    const { width, height } = getWidthHeightFromTexture(mapTexture);
    const ratio = height / width;
    const geometry = new THREE.PlaneGeometry(this.canvasWidth, this.canvasWidth! * ratio);

    mapTexture.needsUpdate = true;
    // isShadowMap implies texture.isRenderTargetTexture
    const material = this.isShadowMap ? shadowMapMaterial : thumbnailMaterial;
    const newMesh = new THREE.Mesh(geometry, material);
    newMesh.name = `TexturePluginMesh for texture ${texture.uuid}`;
    // cleanupAfterRemovedObject will dispose the geometry and material, but we prevent that here
    newMesh.__inspectorData.preventDestroy = true;
    // caching the mesh since it seems it takes long to create it and influences CPanel re-rendering
    // when certain things change (things that trigger CPanel re-construction like rad/deg rotation, TMode, TSpace, ...)
    cacheMeshMap.set(texture.uuid, { mesh: newMesh, mapTexture, ratio });
    return { mesh: newMesh, ratio };
  }

  changeImage(texture: THREE.Texture) {
    const { mesh } = this.makeMeshFromTexture(texture);
    offlineScene.add(mesh);
    // rendering with offlineRenderer does not work for shadow maps
    const renderer = this.gl;

    const rendererPixelRatio = renderer.getPixelRatio();
    const rendererSize = new THREE.Vector2();
    renderer.getSize(rendererSize);
    const rendererAutoClear = renderer.autoClear;

    renderer.setPixelRatio(1);
    renderer.setSize(this.canvasWidth!, this.canvasWidth!);

    renderer.autoClear = false; // To allow render overlay
    renderer.clearDepth();
    renderer.render(offlineScene, offlineOrthographicCamera);
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.drawImage(this.gl.domElement, 0, 0);
    // revert to original renderer configuration
    renderer.autoClear = rendererAutoClear; // Restore user's setting
    renderer.setSize(rendererSize.width, rendererSize.height);
    renderer.setPixelRatio(rendererPixelRatio);
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

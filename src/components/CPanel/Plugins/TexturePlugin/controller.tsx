import { Controller, Value, ViewProps } from '@tweakpane/core';
import { TextureView, cacheMeshMap } from './view';
import { createTexturesFromImages } from 'lib/utils/loadTexture';
import { Modal } from 'components/Modal/Modal';
import * as THREE from 'three';
import { useAppStore } from 'src/store';
import { createRoot } from 'react-dom/client';

let reactRoot: ReturnType<typeof createRoot> | null = null;
export const rememberCubeTextureRenderLayout = new Map<string, 'cross' | 'equirectangular'>();

// what we need to dispose here are the mesh geometries and textures that are different from the original textures
export const dispose = () => {
  cacheMeshMap.forEach((value) => {
    value.mesh.geometry.dispose();

    // we're using 2 singleton materials, so we don't need to dispose them
    // const materials = (
    //   Array.isArray(value.mesh.material) ? value.mesh.material : [value.mesh.material]
    // ) as THREE.ShaderMaterial[];
    // materials.forEach((material: THREE.ShaderMaterial) => {
    //   // Object.keys(material.uniforms).forEach((key) => {
    //   //   const uniformValue = material.uniforms[key].value;
    //   //   if (uniformValue instanceof THREE.Texture && uniformValue.userData?.shouldBeDestroyed) {
    //   //     uniformValue.dispose();
    //   //   }
    //   // });
    //   material.dispose();
    // });

    // shouldBeDestroyed is set to in the view true when it's not the same as the original one
    // because, the view can create a new texture or use the original one in its ShaderMaterials
    if (value.mapTexture.userData?.shouldBeDestroyed) {
      value.mapTexture.dispose();
    }
  });
  cacheMeshMap.clear();
  rememberCubeTextureRenderLayout.clear();
};

const cleanUp = (self: TextureController) => {
  self.isMounted = false;
  self.view.input.removeEventListener('change', self.onFile);
  self.view.canvas.removeEventListener('click', self.openFileBrowser);
  self.view.canvas.removeEventListener('pointerup', self.enlargeImage);
  self.view.select.removeEventListener('change', self.handleCubeLayoutChange);
  self.objectURL && URL.revokeObjectURL(self.objectURL);
};

window.addEventListener('TIFMK.ClearScene', dispose);
window.addEventListener('TIFMK.ClearInspectorCache', dispose);

function onRelatedObjectRemovedHandler(this: TextureController) {
  this.relatedObject?.removeEventListener('removed', this.onRelatedObjectRemovedHandler);
  dispose();
}

export interface TextureControllerConfig {
  value: Value<THREE.Texture>;
  extensions: string[];
  viewProps: ViewProps;
  gl: THREE.WebGLRenderer;
  isShadowMap: boolean;
  renderTarget?: THREE.WebGLRenderTarget | THREE.WebGLCubeRenderTarget;
  extractOneTextureAtIndex?: number;
  cubeTextureRenderLayout?: 'cross' | 'equirectangular';
  canvasWidth?: number;
}
let debugID = 1;
export class TextureController implements Controller<TextureView> {
  public readonly value: Value<THREE.Texture>;
  public readonly view: TextureView;
  public readonly viewProps: ViewProps;
  public isMounted: boolean = true;
  public relatedObject: THREE.Object3D | null = null;
  public debugID = debugID++;
  public objectURL?: ReturnType<typeof URL.createObjectURL>;
  public onRelatedObjectRemovedHandler: (this: TextureController) => void;
  public gl: THREE.WebGLRenderer;

  constructor(doc: Document, config: TextureControllerConfig) {
    this.value = config.value;
    if (
      this.value.rawValue instanceof THREE.CubeTexture &&
      !rememberCubeTextureRenderLayout.get(this.value.rawValue.uuid)
    ) {
      rememberCubeTextureRenderLayout.set(this.value.rawValue.uuid, config.cubeTextureRenderLayout || 'cross');
    }

    this.viewProps = config.viewProps;
    this.gl = config.gl;

    // if (this.value.rawValue instanceof THREE.CubeTexture) {
    //   // console.log('TexturePlugin TextureController constructor', { config });
    // }

    this.view = new TextureView(doc, {
      viewProps: this.viewProps,
      extensions: config.extensions,
      gl: this.gl,
      isShadowMap: config.isShadowMap,
      renderTarget: config.renderTarget,
      extractOneTextureAtIndex: config.extractOneTextureAtIndex,
      cubeTextureRenderLayout: rememberCubeTextureRenderLayout.get(this.value.rawValue.uuid),
      canvasWidth: config.canvasWidth
    });

    this.onRelatedObjectRemovedHandler = onRelatedObjectRemovedHandler.bind(this);
    this.onFile = this.onFile.bind(this);
    this.openFileBrowser = this.openFileBrowser.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.enlargeImage = this.enlargeImage.bind(this);
    this.updateImage = this.updateImage.bind(this);
    this.handleCubeLayoutChange = this.handleCubeLayoutChange.bind(this);

    this.relatedObject = useAppStore.getState().getSelectedObject();
    this.relatedObject?.addEventListener('removed', this.onRelatedObjectRemovedHandler);
    this.view.input.addEventListener('change', this.onFile);
    !this.viewProps.get('disabled') && this.view.canvas.addEventListener('click', this.openFileBrowser);
    this.value.emitter.on('change', this.handleValueChange);
    // this.viewProps.emitter.on('change', (evt) => {
    //   console.log('TexturePlugin viewProps.emitter.on change', evt);
    // });
    this.view.canvas.addEventListener('pointerup', this.enlargeImage);
    // this select is only added to DOM when it's a CubeTexture
    this.view.select.addEventListener('change', this.handleCubeLayoutChange);

    this.viewProps.handleDispose(() => {
      cleanUp(this);
    });

    this.updateImage();
    // console.log('TextureController constructor done', { config, this: this });
  }

  handleCubeLayoutChange() {
    const layout = this.view.select.value as 'cross' | 'equirectangular';
    rememberCubeTextureRenderLayout.set(this.value.rawValue.uuid, layout);
    this.view.cubeTextureRenderLayout = layout;
    this.updateImage(true);
  }

  enlargeImage(evt: PointerEvent) {
    if (evt.button !== 2 || reactRoot) return; // reactRoot means we're using the modal
    const modalContainer = document.createElement('div');
    document.body.appendChild(modalContainer);
    const canvas = document.createElement('canvas');
    canvas.width = this.view.canvas.width;
    canvas.height = this.view.canvas.height;
    const isEquirectangular =
      this.value.rawValue instanceof THREE.CubeTexture && this.view.select.value === 'equirectangular';
    if (isEquirectangular) {
      canvas.height = this.view.canvas.height / 2;
    }
    canvas.style.width = '100%';
    const ctx = canvas.getContext('2d')!;
    isEquirectangular
      ? // make it ready to be downloaded as equirectangular image and imported as scene bg equirectangular texture
        ctx.drawImage(
          this.view.canvas,
          0, // sx
          this.view.canvas.height / 4, // sy
          this.view.canvas.width, // sw
          this.view.canvas.height / 2, // sh
          0, // dx
          0, // dy
          canvas.width, // dw
          canvas.height // dh
        )
      : ctx.drawImage(this.view.canvas, 0, 0, canvas.width, canvas.height);

    reactRoot = createRoot(modalContainer);
    reactRoot.render(
      <Modal
        isOpen={true}
        width={window.innerWidth <= window.innerHeight ? '80vw' : '80vh'}
        onClose={() => {
          canvas.remove();
          reactRoot?.unmount();
          modalContainer.remove();
          reactRoot = null;
        }}
        title="Texture"
      >
        {canvas}
      </Modal>
    );
  }

  openFileBrowser() {
    this.view.input.click();
  }

  onFile(event: Event): void {
    // console.log('TextureController on file', event);
    if (!this.isMounted) return;
    const files = (event?.target as HTMLInputElement).files;
    if (!files || !files.length) return;

    this.setIsLoading(true);
    // For UX to not allow choosing another file while loading
    this.view.canvas.removeEventListener('click', this.openFileBrowser);
    createTexturesFromImages(files, { material: null })
      .then((textures) => {
        const texture = textures[0];
        if (!this.isMounted) return;
        // prettier-ignore
        // console.log('TexturePlugin TextureController texture loaded', { texture, 'this.isMounted': this.isMounted});
        this.setIsLoading(false);
        // prettier-ignore
        // console.log('TexturePlugin TextureController value.setRawValue', { texture, 'this.isMounted': this.isMounted });
        this.value.rawValue.dispose(); // release old texture
        this.value.setRawValue(texture, {
          forceEmit: true,
          last: true
        });
        setTimeout(() => {
          if (!this.isMounted) return;
          // Re-allow choosing another file
          this.view.canvas.addEventListener('click', this.openFileBrowser);
        });
      })
      .catch((err) => {
        // Take care to remove it async(on setTimeout) to prevent this error (TpError.alreadyDisposed).
        if (err.message === 'View has been already disposed') return;
        console.log('TexturePlugin TextureController caught', err, this);
      });
  }

  handleValueChange(_evt?: any) {
    // prettier-ignore
    // console.log('TextureController this.value.emitter.on(`change`) handleValueChange',
    //   { 'this.value.rawValue': this.value.rawValue, this: this, _evt });
    this.updateImage();
  }

  public updateImage(invalidateCache: boolean = false) {
    const texture = this.value.rawValue;
    if (!this.isMounted || !texture) return;
    if (invalidateCache) {
      cacheMeshMap.delete(texture.uuid);
    }
    this.view.changeImage(texture);
  }

  private setIsLoading(isLoading: boolean) {
    this.view.setIsLoading(isLoading);
  }
}

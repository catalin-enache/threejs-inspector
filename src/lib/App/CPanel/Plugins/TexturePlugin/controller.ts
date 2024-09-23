import { Controller, Value, ViewProps } from '@tweakpane/core';
import { TextureView, cacheMeshMap } from './view';
import { createTexturesFromImages } from 'lib/utils/imageUtils';
import * as THREE from 'three';
import { useAppStore } from 'src/store';

const cleanUp = (self: TextureController) => {
  // cleanup cacheMeshMap when no object is selected
  if (!useAppStore.getState().getSelectedObject()) {
    cacheMeshMap.forEach((value) => {
      value.mesh.geometry.dispose();
      const materials = Array.isArray(value.mesh.material) ? value.mesh.material : [value.mesh.material];
      materials.forEach((material) => {
        const textures = Object.values(material).filter((value) => value instanceof THREE.Texture);
        textures.forEach((texture) => {
          (texture as THREE.Texture).dispose();
        });
        (material as THREE.Material).dispose();
      });
      value.mapTexture.dispose();
    });
    cacheMeshMap.clear();
  }

  self.isMounted = false;
  window.removeEventListener('TweakpaneRemove', self.onRemoveHandler);
  self.view.input.removeEventListener('change', self.onFile);
  self.view.canvas.removeEventListener('click', self.openFileBrowser);
  self.objectURL && URL.revokeObjectURL(self.objectURL);
};

function onRemoveHandler(this: TextureController, evt: any) {
  if (evt.detail.child.controller.valueController === this) {
    // prettier-ignore
    // console.log('TweakpaneRemove', evt.detail, { this: this });
    cleanUp(this);
  }
}

export interface TextureControllerConfig {
  value: Value<THREE.Texture>;
  extensions: string[];
  viewProps: ViewProps;
  gl?: THREE.WebGLRenderer;
}
let debugID = 1;
export class TextureController implements Controller<TextureView> {
  public readonly value: Value<THREE.Texture>;
  public readonly view: TextureView;
  public readonly viewProps: ViewProps;
  public isMounted: boolean = true;
  public debugID = debugID++;
  public objectURL?: ReturnType<typeof URL.createObjectURL>;
  public onRemoveHandler: (this: TextureController, evt: any) => void;
  public gl?: THREE.WebGLRenderer | null;

  constructor(doc: Document, config: TextureControllerConfig) {
    this.value = config.value;
    this.viewProps = config.viewProps;
    this.gl = config.gl;
    this.view = new TextureView(doc, {
      viewProps: this.viewProps,
      extensions: config.extensions
    });

    this.onRemoveHandler = onRemoveHandler.bind(this);

    window.addEventListener('TweakpaneRemove', this.onRemoveHandler);

    this.onFile = this.onFile.bind(this);
    this.openFileBrowser = this.openFileBrowser.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.view.input.addEventListener('change', this.onFile);
    this.view.canvas.addEventListener('click', this.openFileBrowser);
    // TODO: add a way to enlarge the canvas on click (on it or on some button) to see the image at better resolution

    this.viewProps.handleDispose(() => {
      // console.log('TexturePlugin handleDispose');
      cleanUp(this);
    });

    this.value.emitter.on('change', this.handleValueChange);
    // this.viewProps.emitter.on('change', (evt) => {
    //   console.log('TexturePlugin viewProps.emitter.on change', evt);
    // });

    this.updateImage();
    // console.log('TextureController constructor done', { config, this: this });
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
    createTexturesFromImages(files, { material: null, gl: this.gl })
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

  private updateImage() {
    // console.log('TexturePlugin TextureController updateImage');
    const texture = this.value.rawValue;
    if (!this.isMounted || !texture) return;
    this.view.changeImage(texture);
  }

  private setIsLoading(isLoading: boolean) {
    this.view.setIsLoading(isLoading);
  }
}

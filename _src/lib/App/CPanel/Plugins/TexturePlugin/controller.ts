import { Controller, Value, ViewProps } from '@tweakpane/core';
import { TextureView } from './view';
import { loadImage } from 'lib/utils/imageUtils';
import * as THREE from 'three';

export interface TextureControllerConfig {
  value: Value<THREE.Texture>;
  extensions: string[];
  viewProps: ViewProps;
}

export class TextureController implements Controller<TextureView> {
  public readonly value: Value<THREE.Texture>;
  public readonly view: TextureView;
  public readonly viewProps: ViewProps;
  private objectURL?: ReturnType<typeof URL.createObjectURL>;

  constructor(doc: Document, config: TextureControllerConfig) {
    this.value = config.value;
    this.viewProps = config.viewProps;

    // console.log('TextureController', { config });

    this.view = new TextureView(doc, {
      viewProps: this.viewProps,
      extensions: config.extensions
    });

    this.onFile = this.onFile.bind(this);
    this.openFileBrowser = this.openFileBrowser.bind(this);
    this.view.input.addEventListener('change', this.onFile);
    this.view.canvas.addEventListener('dblclick', this.openFileBrowser);
    // TODO: add a way to enlarge the canvas on click (on it or on some button) to see the image at better resolution

    this.viewProps.handleDispose(() => {
      this.view.input.removeEventListener('change', this.onFile);
      this.view.canvas.removeEventListener('dblclick', this.openFileBrowser);
      this.objectURL && URL.revokeObjectURL(this.objectURL);
    });

    this.value.emitter.on('change', () => this.handleValueChange());

    this.handleValueChange();
  }

  private openFileBrowser() {
    this.view.input.click();
  }

  private onFile(event: Event): void {
    const files = (event?.target as HTMLInputElement).files;
    if (!files || !files.length) return;

    const file = files[0];

    this.setIsLoading(true);
    this.view.canvas.removeEventListener('dblclick', this.openFileBrowser);
    loadImage(file).then((texture) => {
      this.setIsLoading(false);
      this.value.rawValue = texture;
      setTimeout(() => {
        this.view.canvas.addEventListener('dblclick', this.openFileBrowser);
      });
    });
  }

  private handleValueChange() {
    // console.log(
    //   'TextureController this.value.emitter.on(`change`) handleValueChange',
    //   this.value.rawValue
    // );
    this.view.changeImage(this.value.rawValue);
  }

  private setIsLoading(isLoading: boolean) {
    this.view.setIsLoading(isLoading);
  }
}

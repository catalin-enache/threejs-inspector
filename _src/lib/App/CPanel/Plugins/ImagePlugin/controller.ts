import { Controller, Value, ViewProps } from '@tweakpane/core';
import { ImageView } from './view';
import { getFileType } from './utils';
// import { EXRLoader } from 'three-stdlib';

export interface ImageControllerConfig {
  value: Value<HTMLImageElement>;
  extensions: string[];
  viewProps: ViewProps;
}

export class ImageController implements Controller<ImageView> {
  public readonly value: Value<HTMLImageElement>;
  public readonly view: ImageView;
  public readonly viewProps: ViewProps;

  constructor(doc: Document, config: ImageControllerConfig) {
    this.value = config.value;
    this.viewProps = config.viewProps;

    console.log('ImageController', { config });

    this.view = new ImageView(doc, {
      value: this.value,
      viewProps: this.viewProps,
      extensions: config.extensions
    });

    this.onFile = this.onFile.bind(this);
    this.view.input.addEventListener('change', this.onFile);
    this.view.image.addEventListener('dblclick', () => this.openFileBrowser());

    this.viewProps.handleDispose(() => {
      this.view.input.removeEventListener('change', this.onFile);
      if (this.value.rawValue) {
        console.log('revokeObjectURL', this.value.rawValue.src);
        URL.revokeObjectURL(this.value.rawValue.src);
      }
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
    const fileType = getFileType(file.name);
    console.log('onFile', fileType);
    const image = document.createElement('img');
    image.src = URL.createObjectURL(file);
    const onLoad = () => {
      image.removeEventListener('load', onLoad);
      this.value.rawValue = image;
    };
    image.addEventListener('load', onLoad);
  }

  private updateImage(src: string) {
    this.view.changeImage(src);
  }

  private handleImage(image: HTMLImageElement) {
    this.updateImage(image.src);
  }

  private handleValueChange() {
    console.log(
      'ImageController this.value.emitter.on(`change`) handleValueChange',
      this.value.rawValue
    );
    this.handleImage(this.value.rawValue);
  }
}

import { Value, ViewProps, View, ClassName } from '@tweakpane/core';
import './imagePlugin.css';

const className = ClassName('img');

export interface ImageViewConfig {
  value: Value<HTMLImageElement>;
  viewProps: ViewProps;
  extensions: string[];
}

export class ImageView implements View {
  public readonly element: HTMLElement;
  public readonly input: HTMLElement;
  public readonly image: HTMLImageElement;

  constructor(doc: Document, config: ImageViewConfig) {
    this.element = doc.createElement('div');
    this.element.classList.add(className());
    this.element.classList.add('imagePlugin');
    config.viewProps.bindClassModifiers(this.element);

    console.log('ImageView constructor', { config });

    this.input = doc.createElement('input');
    this.input.classList.add(className('input'));
    this.input.classList.add('imagePlugin_input');
    this.input.setAttribute('type', 'file');
    this.input.setAttribute('accept', config.extensions.join(','));
    this.element.appendChild(this.input);

    this.image = doc.createElement('img');
    this.image.classList.add(className('image'));
    this.image.classList.add('imagePlugin_image');
    this.element.appendChild(this.image);
  }

  changeImage(src: string) {
    this.image.src = src;
  }
}

import {
  BaseInputParams,
  NumberInputParams,
  TpPluginBundle,
  createPlugin,
  // TpPlugin,
  BindingTarget,
  Value,
  ValueController,
  ViewProps,
  View,
  InputBindingPlugin
} from '@tweakpane/core';

interface KVENumberPlugin extends BaseInputParams, NumberInputParams {}

export const KVENumberPlugin: InputBindingPlugin<
  number,
  number,
  KVENumberPlugin
> = createPlugin({
  // api: {},
  id: 'counter',
  type: 'input',
  accept(value: unknown, params: Record<string, unknown>) {
    if (typeof value !== 'number') {
      return null;
    }
    if (params.view !== 'counter') {
      return null;
    }
    console.log('accept', value, params);
    return {
      initialValue: value,
      params: params
    };
  },

  binding: {
    reader: () => (value: unknown) => {
      console.log('binding.reader', value);
      return Number(value);
    },
    writer: () => (target: BindingTarget, value: number) => {
      console.log('binding.writer', value);
      target.write(value);
    }
  },

  controller(args: any) {
    return new CounterController(args.document, {
      value: args.value,
      viewProps: args.viewProps
    });
  }
});

interface CounterControllerConfig {
  value: Value<number>;
  viewProps: ViewProps;
}

export class CounterController implements ValueController<number, CounterView> {
  public readonly value: Value<number>;
  public readonly view: CounterView;
  public readonly viewProps: ViewProps;

  constructor(doc: Document, config: CounterControllerConfig) {
    // Models
    this.value = config.value;
    this.viewProps = config.viewProps;

    // Create a view
    this.view = new CounterView(doc, {
      value: config.value,
      viewProps: this.viewProps
    });

    // Handle user interaction
    this.view.buttonElement.addEventListener('click', () => {
      // Update a model
      this.value.rawValue += 1;
    });
  }
}

interface CounterViewConfig {
  value: Value<number>;
  viewProps: ViewProps;
}

export class CounterView implements View {
  public readonly element: HTMLElement;
  public readonly buttonElement: HTMLButtonElement;

  constructor(doc: Document, config: CounterViewConfig) {
    // Create view elements
    this.element = doc.createElement('div');
    this.element.classList.add('tp-counter');

    // Apply value changes to the preview element
    const previewElem = doc.createElement('div');
    const value = config.value;
    value.emitter.on('change', () => {
      previewElem.textContent = String(value.rawValue);
    });
    previewElem.textContent = String(value.rawValue);
    this.element.appendChild(previewElem);

    // Create a button element for user interaction
    const buttonElem = doc.createElement('button');
    buttonElem.textContent = '+';
    this.element.appendChild(buttonElem);
    this.buttonElement = buttonElem;
  }
}

export const KVEBundle: TpPluginBundle = {
  id: 'kve',
  css: `
    .tp-counter {align-items: center; display: flex;}
    .tp-counter div {color: #00ffd680; flex: 1;}
    .tp-counter button {background-color: #00ffd6c0; border-radius: 2px; color: black; height: 20px; width: 20px;}
  `,
  plugins: [KVENumberPlugin]
};

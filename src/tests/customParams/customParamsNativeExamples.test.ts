import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { BindingParams } from 'tweakpane';
import { screen, waitFor } from '@testing-library/dom';
import { defaultScene } from 'lib/patchThree';
import { useAppStore } from 'src/store';
import { CPanelProps } from 'components/CPanel/CPanel';
import { initNativeApp, InitNativeAppProps } from 'testutils/testNativeApp';
import { radToDegFormatter } from 'lib/utils/formatters';

/*
CParam options reused among different types:
object: bindingObject

prop: string; // the property name in the binding object

Control options:

view?: 'text' | 'color' | 'graph' | 'radiogrid' | 'buttongrid' | 'cubicbezier;

hidden?: boolean;
disabled?: boolean;

picker?: 'inline' | 'popup'; // PickerLayout // forced as 'inline' in CPanel to prevent layout issues
expanded?: boolean;

====================================================

String:
object: {
  value: 'string',
}
prop: string;
control: {
  label?: string;
  view?: 'text', // force text view for values that can be interpreted as numbers
  onChange?: (val: string) => void;
}

====================================================

Select:
object: {
  selected: 'option 2',
}
prop: string;
control: {
  label?: string;
  options: {
    'option 1': 'option 1',
    'option 2': 'option 2',
    'option 3': 'option 3',
  },
  onChange?: (val: string) => void;
}
====================================================

Boolean:
object: {
  value: false,
}
prop: string;
control: {
  label?: string;
  onChange?: (val: boolean) => void;
}

====================================================

Number:
object: {
  value: 0,
}
prop: string;
control: {
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  keyScale?: number; // The unit scale for key input.
  pointerScale?: number; // The unit scale for pointer input.
  format?: (val: number) => string;
  onChange?: (val: number) => void;
}

====================================================

Interval:
object: {
  value: { min: 0, max: 0.2 },
}
prop: string;
control: {
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (val: { min: number, max: number }) => void;
}

====================================================

Color:
object: {
  value: { r: 0, g: 0, b: 0, a: 1 } | 0x00ffd644 | '#f05' | 'rgb(0, 255, 214)',
}
prop: string;
control: {
  label?: string;
  view?: 'color', // force color view for values that can be interpreted as numbers
  color?: {
    alpha?: boolean;
    type?: 'float' | 'int'; // ColorType 0-1 / 0-255
  },
  picker?: 'inline' | 'popup';
  expanded?: boolean;
  onChange?: (val) => void;
}

====================================================

Point 2D:
object: {
  value: { x: 0, y: 0 },
}
prop: string;
control: {
  label?: string;
  // Each dimension can be constrained with 'step', 'min' and 'max' parameters just like a numeric input.
  // Y dimension can be inverted with 'inverted' parameter.
  x: { min: number, max: number, step: number },
  y: { min: number, max: number, step: number, inverted: boolean },
  picker?: 'inline' | 'popup';
  expanded?: boolean;
  onChange?: (val: { x: number, y: number }) => void;
}

====================================================

Point 3D/4D:
You can constrain each axis same as Point 2D.
object: {
  value: { x: 0, y: 0, z: 0, w: 0 },
}
prop: string;
control: {
  label?: string;
  x: { min: number, max: number, step: number },
  y: { min: number, max: number, step: number, inverted: boolean },
  ...
  onChange?: (val: { x: number, y: number, z: number, w: number }) => void;
}

====================================================

RadioGrid:
object: {
  value: 25,
  scales: [10, 20, 25, 50, 75, 100], // just a helper
}
prop: string; // point to value
control: {
  label?: string,
  view: 'radiogrid', // this is mandatory to enforce a radio grid view
  groupName: string;
  size: [number, number];
  cells: (x: number, y: number) => ({
    title: `${radioGridObject.scales[y * 3 + x]}%`,
    value: radioGridObject.scales[y * 3 + x]
  }),
  onChange?: ({ val: any, object: any, prop: string }) => void;
}

====================================================

Button:
control: {
  label?: string;
  title: string;
  onClick?: (control: ControlObject) => void;
}

====================================================

ButtonGrid:
control: {
  label?: string;
  view: 'buttongrid', // this is mandatory to enforce a button grid view
  size: [number, number];
  cells: (x: number, y: number) => ({
    title: ['NW', 'N', 'NE', 'W', '*', 'E', 'SW', 'S', 'SE'][y * 3 + x]
  }),
  onClick?: ({ title: string, index: [number, number] }) => void;
}

====================================================

CubicBezier:
control: {
  label?: string;
  view: 'cubicbezier', // this is mandatory to enforce a cubic bezier view
  value: [number, number, number, number];
  picker?: 'inline' | 'popup';
  expanded?: boolean;
  onChange?: ({ x1: number, x2: number, y1: number, y2: number }) => void;
}

====================================================


Monitor:
object: {
  value: any, // most likely a string // it could be a JSON stringified object
}
prop: string;
control: {
  label?: string;
  readonly: true;
  multiline?: boolean;
  rows?: number;
  interval?: number; // how fast the value is updated // Note that CPanel also has a Continuous Update option
  bufferSize?: number;
  view?: 'graph'; // will display a historical graph of the value
  min?: number;
  max?: number;
}

====================================================

Texture:
object: {
  value: any,
}
prop: string;
control: {
  label?: string;
  gl: WebGLRenderer; // required, needs to be the scene renderer
  isShadowMap?: boolean; // for lights
  disabled?: boolean; // disallow changing the texture
  cubeTextureRenderLayout?: 'cross' | 'equirectangular'; // for cube map, defaults to cross
  canvasWidth?: number; // power of 2 - controls the resolution, the height is auto
  renderTarget?: WebGLRenderTarget | WebGLCubeRenderTarget; // used for reading pixels from GPU for certain textures
  onChange?: (textureValue, object, prop) => void; // (e.g. Texture, scene, 'background')
}

**/

describe('Custom Params examples', () => {
  beforeEach(() => {});

  afterEach(() => {
    defaultScene.clear();
    useAppStore.getState().reset();
  });
  // TODO: add texture plugin test
  it('can be all tweakpane inputs', { timeout: 61000 }, async () => {
    return new Promise<void>((done) => {
      const stringObject = { val: 'hello' };
      const selectObject = { selected: 'option 2' };
      const numericObject = { num: 0 };
      const intervalObject = { val: { min: 0, max: 0.2 } };
      const booleanObject = { val: false };
      const vec2Object = { vec2: { x: 0, y: 0 } };
      const vec3Object = { vec3: { x: 0, y: 0, z: 0 } };
      const colorObject = { color: { r: 0, g: 0, b: 0, a: 1 } };
      const colorObject2 = { color: 0xff0055 };
      const vec4Object = { vec4: { x: 0, y: 0, z: 0, w: 0 } };
      const radioGridObject = { val: 25, scales: [10, 20, 25, 50, 75, 100] };
      const cubicBezierValue = [0.5, 0, 0.5, 1];

      const printValue = (_val: any) => {
        // console.log(_val);
      };
      const handleStringChange = vi.fn(printValue);
      const handleSelectChange = vi.fn(printValue);
      const handleNumericChange = vi.fn(printValue);
      const handleIntervalChange = vi.fn(printValue);
      const handleBooleanChange = vi.fn(printValue);
      const handleVec2Change = vi.fn((val) => {
        printValue(val);
        stringObject.val = JSON.stringify(val, undefined, 2);
      });
      const handleVec3Change = vi.fn(printValue);
      const handleColorChange = vi.fn(printValue);
      const handleVec4Change = vi.fn(printValue);
      const handleRadioGridChange = vi.fn(printValue);
      const handleButtonClick = vi.fn(printValue);
      const handleCubeBezierChange = vi.fn(printValue);

      const customParams: NonNullable<InitNativeAppProps['customParams']> = {
        String: {
          object: stringObject,
          prop: 'val',
          control: {
            label: 'Text',
            // Note: Change is fired only on blur or enter key
            onChange: handleStringChange
          } as BindingParams
        },
        Select: {
          object: selectObject,
          prop: 'selected',
          control: {
            label: 'Select',
            options: ['option 1', 'option 2', 'option 3'].reduce((acc, option) => {
              acc[option] = option;
              return acc;
            }, {} as any),
            onChange: handleSelectChange
          } as BindingParams
        },
        Numbers: {
          numeric: {
            object: numericObject,
            prop: 'num',
            control: {
              label: 'Numeric',
              min: 0,
              max: 1,
              step: 0.1,
              format: radToDegFormatter,
              onChange: handleNumericChange
            } as BindingParams
          },
          interval: {
            object: intervalObject,
            prop: 'val',
            control: {
              label: 'Interval',
              min: 0,
              max: 1,
              step: 0.1,
              onChange: handleIntervalChange
            } as BindingParams
          }
        },
        Boolean: {
          object: booleanObject,
          prop: 'val',
          control: {
            label: 'Boolean',
            onChange: handleBooleanChange
          } as BindingParams
        },
        Vectors: {
          vec2: {
            object: vec2Object,
            prop: 'vec2',
            control: {
              label: 'Vec2',
              x: { min: -1, max: 1, step: 0.1 },
              y: { inverted: true },
              onChange: handleVec2Change
            } as BindingParams
          },
          vec3: {
            object: vec3Object,
            prop: 'vec3',
            control: {
              label: 'Vec3',
              onChange: handleVec3Change
            } as BindingParams
          },
          vec4: {
            object: vec4Object,
            prop: 'vec4',
            control: {
              label: 'Vec4',
              onChange: handleVec4Change
            } as BindingParams
          }
        },
        Colors: {
          color: {
            object: colorObject,
            prop: 'color',
            control: {
              label: 'Color 1',
              color: { type: 'float' },
              onChange: handleColorChange
            } as BindingParams
          },
          color2: {
            object: colorObject2,
            prop: 'color',
            control: {
              label: 'Color 2',
              // view: 'text',
              view: 'color',
              color: { alpha: true },
              expanded: true,
              onChange: handleColorChange
            } as BindingParams
          }
        },
        radioGrid: {
          object: radioGridObject,
          prop: 'val',
          control: {
            label: 'Radio Grid',
            view: 'radiogrid',
            groupName: 'gName',
            size: [3, 2],
            cells: (x: number, y: number) => ({
              title: `${radioGridObject.scales[y * 3 + x]}%`,
              value: radioGridObject.scales[y * 3 + x]
            }),
            onChange: handleRadioGridChange
          }
        },
        Buttons: {
          button: {
            control: {
              label: 'Button',
              title: 'Click me',
              onClick: handleButtonClick
            }
          },
          buttonGrid: {
            control: {
              label: 'Button Grid',
              view: 'buttongrid',
              size: [3, 3],
              cells: (x: number, y: number) => ({
                title: [
                  ['NW', 'N', 'NE'],
                  ['W', '*', 'E'],
                  ['SW', 'S', 'SE']
                ][y][x]
              }),
              onClick: handleButtonClick
            }
          }
        },
        cubicBezier: {
          control: {
            label: 'Cubic Bezier',
            view: 'cubicbezier',
            value: cubicBezierValue,
            expanded: true,
            picker: 'inline',
            onChange: handleCubeBezierChange
          }
        },
        monitor1: {
          // object: numericObject,
          // prop: 'num',
          object: stringObject,
          prop: 'val',
          control: {
            label: 'Monitor 1',
            readonly: true,
            // min: 0,
            // max: 1,
            // bufferSize: 2,
            multiline: true,
            rows: 4
            // interval: 1000
          } as BindingParams
        }
      };

      const handleCPanelReady: CPanelProps['onCPanelReady'] = async () => {
        expect(stringObject.val).toBe('hello');
        const textLabel = await screen.findByText('Text');
        const textInput = textLabel.parentElement!.querySelector('input')!;
        textInput.value = 'hello world';
        textInput.dispatchEvent(new Event('change'));
        expect(stringObject.val).toBe('hello world');

        expect(selectObject.selected).toBe('option 2');
        const selectLabel = await screen.findByText('Select');
        const selectInput = selectLabel.parentElement!.querySelector('select')!;
        selectInput.value = 'option 3';
        selectInput.dispatchEvent(new Event('change'));
        expect(selectObject.selected).toBe('option 3');

        expect(numericObject.num).toBe(0.0); // radToDeg(5.7)
        const numericLabel = await screen.findByText('Numeric');
        const numericInput = numericLabel.parentElement!.querySelector('input')!;
        numericInput.value = '5.7';
        numericInput.dispatchEvent(new Event('change'));
        expect(numericObject.num).toBe(0.1); // radToDeg(5.7)

        expect(intervalObject.val).toEqual({ min: 0.0, max: 0.2 });
        const intervalLabel = await screen.findByText('Interval');
        const [intervalInput1, intervalInput2] = intervalLabel.parentElement!.querySelectorAll('input')!;
        intervalInput1.value = '0.2';
        intervalInput1.dispatchEvent(new Event('change'));
        intervalInput2.value = '0.4';
        intervalInput2.dispatchEvent(new Event('change'));
        expect(intervalObject.val).toEqual({ min: 0.2, max: 0.4 });

        expect(booleanObject.val).toBe(false);
        const booleanLabel = await screen.findByText('Boolean');
        const booleanInput = booleanLabel.parentElement!.querySelector('input')!;
        booleanInput.click();
        expect(booleanObject.val).toBe(true);

        expect(vec2Object.vec2).toEqual({ x: 0, y: 0 });
        const vec2Label = await screen.findByText('Vec2');
        const [vec2Input1, vec2Input2] = vec2Label.parentElement!.querySelectorAll('input')!;
        vec2Input1.value = '0.5';
        vec2Input1.dispatchEvent(new Event('change'));
        vec2Input2.value = '0.8';
        vec2Input2.dispatchEvent(new Event('change'));
        expect(vec2Object.vec2).toEqual({ x: 0.5, y: 0.8 });
        const monitorLabel = await screen.findByText('Monitor 1');
        const monitorInput = monitorLabel.parentElement!.querySelector('textarea')!;
        await waitFor(() =>
          expect(monitorInput.value).toBe(`{
  "x": 0.5,
  "y": 0.8
}`)
        );

        expect(vec3Object.vec3).toEqual({ x: 0, y: 0, z: 0 });
        const vec3Label = await screen.findByText('Vec3');
        const [vec3Input1, vec3Input2, vec3Input3] = vec3Label.parentElement!.querySelectorAll('input')!;
        vec3Input1.value = '0.5';
        vec3Input1.dispatchEvent(new Event('change'));
        vec3Input2.value = '0.8';
        vec3Input2.dispatchEvent(new Event('change'));
        vec3Input3.value = '0.3';
        vec3Input3.dispatchEvent(new Event('change'));
        expect(vec3Object.vec3).toEqual({ x: 0.5, y: 0.8, z: 0.3 });

        expect(vec4Object.vec4).toEqual({ x: 0, y: 0, z: 0, w: 0 });
        const vec4Label = await screen.findByText('Vec4');
        const [vec4Input1, vec4Input2, vec4Input3, vec4Input4] = vec4Label.parentElement!.querySelectorAll('input')!;
        vec4Input1.value = '0.5';
        vec4Input1.dispatchEvent(new Event('change'));
        vec4Input2.value = '0.8';
        vec4Input2.dispatchEvent(new Event('change'));
        vec4Input3.value = '0.3';
        vec4Input3.dispatchEvent(new Event('change'));
        vec4Input4.value = '0.1';
        vec4Input4.dispatchEvent(new Event('change'));
        expect(vec4Object.vec4).toEqual({ x: 0.5, y: 0.8, z: 0.3, w: 0.1 });

        expect(colorObject.color).toEqual({ r: 0, g: 0, b: 0, a: 1 });
        const colorLabel = await screen.findByText('Color 1');
        const colorToggleButton = colorLabel.parentElement!.querySelector('button')!;
        colorToggleButton.click();
        const [c1_, c1r, c1g, c1b, c1a] = colorLabel.parentElement!.querySelectorAll('input')!;
        c1r.value = '0.2';
        c1r.dispatchEvent(new Event('change'));
        c1g.value = '0.2';
        c1g.dispatchEvent(new Event('change'));
        c1b.value = '0.2';
        c1b.dispatchEvent(new Event('change'));
        c1a.value = '0.2';
        c1a.dispatchEvent(new Event('change'));
        expect(colorObject.color).toEqual({ r: 0.2, g: 0.2, b: 0.2, a: 0.2 });
        expect(c1_.value).toBe('{r: 0.20, g: 0.20, b: 0.20, a: 0.20}');

        expect(colorObject2).toEqual({ color: 0xff0055 });
        const colorLabel2 = await screen.findByText('Color 2');
        const [c2_, c2r, c2g, c2b, c2a] = colorLabel2.parentElement!.querySelectorAll('input')!;
        expect(c2r.value).toBe('0');
        expect(c2g.value).toBe('255');
        expect(c2b.value).toBe('0');
        expect(c2a.value).toBe('0.33');
        c2r.value = '255';
        c2r.dispatchEvent(new Event('change'));
        c2g.value = '0';
        c2g.dispatchEvent(new Event('change'));
        c2b.value = '255';
        c2b.dispatchEvent(new Event('change'));
        c2a.value = '0.66';
        c2a.dispatchEvent(new Event('change'));
        expect(colorObject2).toEqual({ color: 0xff00ffa8 });
        expect(c2_.value).toBe('0xff00ffa8');

        expect(radioGridObject.val).toBe(25);
        const radioGridLabel = await screen.findByText('Radio Grid');
        const radioGridInputs = radioGridLabel.parentElement!.querySelectorAll('input')!;
        radioGridInputs[0].click();
        expect(radioGridObject.val).toBe(10);

        const buttonLabel = await screen.findByText('Button');
        const button = buttonLabel.parentElement!.querySelector('button')!;
        button.click();
        expect(handleButtonClick).toHaveBeenCalledTimes(1);
        // @ts-ignore
        expect(handleButtonClick.mock.calls[0][0]).toBe(customParams.Buttons.button.control);

        const buttonGridLabel = await screen.findByText('Button Grid');
        const buttonGridButtons = buttonGridLabel.parentElement!.querySelectorAll('button')!;
        buttonGridButtons[4].click();
        expect(handleButtonClick).toHaveBeenCalledTimes(2);
        // @ts-ignore
        expect(handleButtonClick.mock.calls[1][0]).toEqual({ title: '*', index: [1, 1] });

        expect(cubicBezierValue).toEqual([0.5, 0, 0.5, 1]);
        const cubicBezierLabel = await screen.findByText('Cubic Bezier');
        const cubicBezierInputs = cubicBezierLabel.parentElement!.querySelectorAll('input')!;
        cubicBezierInputs[1].value = '0.3';
        cubicBezierInputs[1].dispatchEvent(new Event('change'));
        expect(handleCubeBezierChange).toHaveBeenCalledTimes(1);
        // @ts-ignore
        expect(handleCubeBezierChange.mock.calls[0][0]).toEqual({ x1: 0.3, x2: 0.5, y1: 0, y2: 1 });
        expect(cubicBezierValue).toEqual([0.5, 0, 0.5, 1]); // unchanged
        expect(cubicBezierInputs[0].value).toEqual('cubic-bezier(0.30, 0.00, 0.50, 1.00)');

        stringObject.val = 'good bye';
        await waitFor(() => expect(textInput.value).toBe('good bye'));
        await waitFor(() => expect(monitorInput.value).toBe('good bye'));

        unmountInspector();
      };

      const handleCPanelUnmounted: CPanelProps['onCPanelUnmounted'] = async () => {
        cleanUp();
        done();
      };

      const { cleanUp, unmountInspector } = initNativeApp({
        autoNavControls: 'always',
        customParams,
        onCPanelReady: handleCPanelReady,
        onCPanelUnmounted: handleCPanelUnmounted
      });
    });
  });
});

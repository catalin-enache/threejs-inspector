import api from './lib/api';
import { Inspector, injectInspector, InjectInspectorParams, InspectorProps } from 'lib/inspector';
import { CustomControl } from 'components/CustomControl/CustomControl';
import { ExperienceSwitcher } from 'components/ExperienceSwitcher/ExperienceSwitcher';
import { usePlay, useDefaultSetup } from 'lib/hooks';
import * as tsExtensions from 'src/tsExtensions';

export { api, Inspector, injectInspector, useDefaultSetup, usePlay, CustomControl, ExperienceSwitcher };
export type { InjectInspectorParams, InspectorProps, tsExtensions };

import api from './lib/api';
import { Inspector, injectInspector, InjectInspectorParams, InspectorProps } from 'lib/inspector';
import { usePlay, useDefaultSetup } from 'lib/hooks';
import * as tsExtensions from 'src/tsExtensions';

export { api, Inspector, injectInspector, useDefaultSetup, usePlay };
export type { InjectInspectorParams, InspectorProps, tsExtensions };

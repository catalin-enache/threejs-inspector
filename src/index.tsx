/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { config } from './config';
import App from './components/App/App';
import { EVENT_TYPE, THREE_EVENT_TYPE } from './constants';
import { ScenarioSelect } from 'src/components/ScenarioSelect';
import './index.css';

import scene from 'scenarios/basic/basic';

window.addEventListener(EVENT_TYPE.THREE, (evt: any) => {
  if (evt.detail.type === THREE_EVENT_TYPE.SCENE_READY) {
    ReactDOM.createRoot(document.getElementById('control')!).render(
      <React.StrictMode>
        <>
          <ScenarioSelect />
          <App scene={evt.detail.object} />
        </>
      </React.StrictMode>
    );
  }
});

scene({ config });

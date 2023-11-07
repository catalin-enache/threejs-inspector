/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { config } from './config';
import App from './App.tsx';
import { EVENT_TYPE, THREE_EVENT_TYPE } from './constants.ts';
import './index.css';

import scene from './scenarios/basic/basic';

window.addEventListener(EVENT_TYPE.THREE, (evt: any) => {
  if (evt.detail.type === THREE_EVENT_TYPE.SCENE_READY) {
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App scene={evt.detail.object} />
      </React.StrictMode>
    );
  }
});

scene(config);

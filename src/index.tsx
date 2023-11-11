/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { config } from './config';
import ControlPanel from 'components/App/ControlPanel.tsx';
import { EVENT_TYPE, THREE_EVENT_TYPE } from './constants';
import { ScenarioSelect } from 'src/components/ScenarioSelect';
import './index.css';

import basic from 'scenarios/basic/basic';

const App = ({ scene }) => {
  return (
    <>
      <ScenarioSelect />
      <ControlPanel scene={scene} />
    </>
  );
};

window.addEventListener(EVENT_TYPE.THREE, (evt: any) => {
  if (evt.detail.type === THREE_EVENT_TYPE.SCENE_READY) {
    ReactDOM.createRoot(document.getElementById('app')!).render(
      <React.StrictMode>
        <App scene={evt.detail.object} />
      </React.StrictMode>
    );
  }
});

basic({ config });

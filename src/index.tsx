/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import ReactDOM from 'react-dom/client';
import { ScenarioSelect } from 'src/components/ControlPanel';
import './index.css';

ReactDOM.createRoot(document.getElementById('controlPanel')!).render(
  // <React.StrictMode>
  <ScenarioSelect />
  // </React.StrictMode>
);

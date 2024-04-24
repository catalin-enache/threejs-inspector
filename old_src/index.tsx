import ReactDOM from 'react-dom/client';
import { ScenarioSelect } from 'old_src/components/ControlPanel';
import './index.css';

ReactDOM.createRoot(document.getElementById('controlPanel')!).render(
  // <React.StrictMode>
  <ScenarioSelect />
  // </React.StrictMode>
);

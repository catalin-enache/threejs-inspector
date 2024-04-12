import { createRoot } from 'react-dom/client';
import { Experience } from 'scenarios/Experience';
import { App } from './App';
import { StrictMode } from 'react';
import './index.css';
const useStrictMode = true;

createRoot(document.getElementById('webgl') as HTMLElement).render(
  useStrictMode ? (
    <StrictMode>
      <App>
        <Experience />
      </App>
    </StrictMode>
  ) : (
    <App>
      <Experience />
    </App>
  )
);

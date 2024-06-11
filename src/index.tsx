import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Experience } from 'scenarios/Experience';
import { App } from './App';
import './index.css';

const useStrictMode = true;

createRoot(document.getElementById('main') as HTMLElement).render(
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

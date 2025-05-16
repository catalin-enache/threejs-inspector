import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Experience as DefaultExperience } from 'scenarios/Experience';
// import { ProjectLongLatOnSphere } from 'scenarios/ProjectLongLatOnSphere';
import { App } from './App';
import './index.css';

const Experience = DefaultExperience;

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

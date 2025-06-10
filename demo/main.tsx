/// <reference types="vite-plugin-glsl/ext" />
import { StrictMode, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { ExperienceSwitcher } from 'src/components/ExperienceSwitcher/ExperienceSwitcher';
// import { Experience as DefaultExperience } from './scenarios/Experience';
// import { ProjectLongLatOnSphere } from './scenarios/ProjectLongLatOnSphere';
import { App } from './App';
import api from 'src/lib/api';
import './main.css';

import { projects } from './projects';
api.setProjects(projects);

// const Experience = DefaultExperience;

// const experiences = [
//   {
//     name: 'Default',
//     Experience: DefaultExperience
//   },
//   {
//     name: 'Project Long/Lat on Sphere',
//     Experience: ProjectLongLatOnSphere
//   }
// ];

const experiences = [
  {
    name: 'Material Test',
    Experience: lazy(() => import('./scenarios/MaterialTest'))
  },
  {
    name: 'Default',
    Experience: lazy(() => import('./scenarios/Experience'))
  },
  {
    name: 'Project Long/Lat on Sphere',
    Experience: lazy(() => import('./scenarios/ProjectLongLatOnSphere'))
  },
  {
    name: 'Flag Shader',
    Experience: lazy(() => import('./scenarios/Shaders/Flag/Flag'))
  }
];

const useStrictMode = true;

createRoot(document.getElementById('main') as HTMLElement).render(
  useStrictMode ? (
    <StrictMode>
      <App>
        {/*<Experience />*/}
        {/*<ProjectLongLatOnSphere />*/}
        <ExperienceSwitcher experiences={experiences} />
      </App>
    </StrictMode>
  ) : (
    <App>
      {/*<Experience />*/}
      {/*<ProjectLongLatOnSphere />*/}
      <ExperienceSwitcher experiences={experiences} />
    </App>
  )
);

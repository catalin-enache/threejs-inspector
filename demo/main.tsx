import { StrictMode, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { ExperienceSwitcher } from 'src/components/ExperienceSwitcher/ExperienceSwitcher';
// import { Experience as DefaultExperience } from './scenarios/Experience';
// import { ProjectLongLatOnSphere } from './scenarios/ProjectLongLatOnSphere';
import { App } from './App';
import './main.css';

// const Experience = DefaultExperience;

// const experiences = [
//   {
//     name: 'Default Experience',
//     Experience: DefaultExperience
//   },
//   {
//     name: 'Project Long/Lat on Sphere',
//     Experience: ProjectLongLatOnSphere
//   }
// ];

const experiences = [
  {
    name: 'Default Experience',
    Experience: lazy(() => import('./scenarios/Experience'))
  },
  {
    name: 'Project Long/Lat on Sphere',
    Experience: lazy(() => import('./scenarios/ProjectLongLatOnSphere'))
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

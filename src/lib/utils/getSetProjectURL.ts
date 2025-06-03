import { AppStore } from 'src/store';

export const setProjectPathToURL = (projectPath: NonNullable<AppStore['currentProjectPath']>): void => {
  const pathName = window.location.pathname;
  const pathParts = pathName.split('/');
  pathParts.pop();
  pathParts.push(projectPath);
  window.location.href = window.location.origin + pathParts.join('/');
};

export const getProjectPathFromURL = (projects: AppStore['projects']): AppStore['currentProjectPath'] => {
  const pathName = window?.location?.pathname?.split('/').pop();
  const projectPath = projects.find((p) => p.path === pathName)?.path ?? projects[0].path ?? null;
  return projectPath;
};

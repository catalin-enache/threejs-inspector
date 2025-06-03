import { useAppStore } from 'src/store';
import { setProjectPathToURL } from 'lib/utils/getSetProjectURL';
import type { onChange, CommonGetterParams } from './bindingTypes';

export const ProjectsBindings = (_params: CommonGetterParams) => {
  const projects = useAppStore.getState().projects;
  return {
    currentProjectPath: {
      label: 'Project',
      options: projects.reduce(
        (acc, project) => {
          acc[project.name] = project.path;
          return acc;
        },
        {} as Record<string, string>
      ),
      onChange: ((_, evt) => {
        setProjectPathToURL(evt.value);
      }) as onChange
    }
  };
};

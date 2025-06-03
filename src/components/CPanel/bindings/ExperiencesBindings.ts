import { useAppStore } from 'src/store';
import { setExperienceURL } from 'lib/utils/getSetExperienceURL';
import type { onChange, CommonGetterParams } from './bindingTypes';

export const ExperiencesBindings = (_params: CommonGetterParams) => {
  const experiences = useAppStore.getState().experiences;
  return {
    currentExperience: {
      label: 'Current',
      options: experiences.reduce(
        (acc, exp) => {
          acc[exp] = exp;
          return acc;
        },
        {} as Record<string, string>
      ),
      onChange: ((_, evt) => {
        setExperienceURL(evt.value);
      }) as onChange
    }
  };
};

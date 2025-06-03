import { JSX, useEffect, useMemo, memo, NamedExoticComponent, Suspense } from 'react';
import { useAppStore } from 'src/store';
import { getExperienceFromURL } from 'lib/utils/getSetExperienceURL';
// import patchThree from 'lib/patchThree';

interface ExperienceSwitcherProps {
  experiences: { name: string; Experience: (() => JSX.Element) | NamedExoticComponent<object> }[];
}

export const ExperienceSwitcher = memo(({ experiences = [] }: ExperienceSwitcherProps) => {
  const setExperiences = useAppStore((state) => state.setExperiences);
  const setCurrentExperience = useAppStore((state) => state.setCurrentExperience);
  const currentExperience = useAppStore((state) => state.currentExperience);

  useEffect(() => {
    if (experiences.length === 0) {
      return;
    }
    setExperiences(experiences.map((exp) => exp.name));
    const currentExp = getExperienceFromURL() ?? experiences[0]?.name;
    setCurrentExperience(currentExp); // to have the correct experience selected in CPanel currentExperience dropdown
    // patchThree.refreshCPanel();
  }, [setExperiences, experiences, setCurrentExperience]);

  const experience = useMemo(() => {
    if (!currentExperience) {
      return null;
    }
    const Experience = experiences.find((exp) => exp.name === currentExperience)?.Experience;
    if (!Experience) {
      return null;
    }

    // Note: Suspense does not require the Experience component to be lazy-loaded,
    return (
      <Suspense fallback={'Loading experience…'}>
        <Experience />
      </Suspense>
    );
  }, [experiences, currentExperience]);

  return experience;
});

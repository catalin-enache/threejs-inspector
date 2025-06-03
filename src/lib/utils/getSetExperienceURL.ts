export const setExperienceURL = (experience: string): void => {
  const url = new URL(window.location.href);
  url.searchParams.set('experience', experience);
  window.location.href = url.toString();
};

export const getExperienceFromURL = (): string | null => {
  const url = new URL(window.location.href);
  return url.searchParams.get('experience');
};

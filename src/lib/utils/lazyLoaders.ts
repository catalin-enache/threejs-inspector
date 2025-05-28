let CPanel: typeof import('components/CPanel/CPanel').CPanel | null = null;

export const getCPanel = async () => {
  if (CPanel) {
    return Promise.resolve(CPanel);
  }
  const module = await import('components/CPanel/CPanel');
  CPanel = module.CPanel;
  return module.CPanel;
};

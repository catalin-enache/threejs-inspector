import type { BindingParams } from 'tweakpane';
import { useAppStore } from 'src/store';
import { useEffect } from 'react';

export interface CustomControlProps {
  name: string;
  object?: Record<string, any>;
  prop?: string;
  control: BindingParams;
  path?: string;
}

export const CustomControl = (props: CustomControlProps) => {
  const { name, prop, control, path = '', object } = props;
  const setOrUpdateCPanelCustomParams = useAppStore((state) => state.setOrUpdateCPanelCustomParams);
  const removeCPanelCustomParams = useAppStore((state) => state.removeCPanelCustomParams);
  const triggerCPanelCustomParamsStructureChanged = useAppStore(
    (state) => state.triggerCPanelCustomParamsStructureChanged
  );

  useEffect(() => {
    const pathArray = path
      .split('/')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    setOrUpdateCPanelCustomParams(name, object, prop, control, pathArray);
    triggerCPanelCustomParamsStructureChanged();
    return () => {
      removeCPanelCustomParams(name, pathArray);
      triggerCPanelCustomParamsStructureChanged();
    };
  }, []);

  return null;
};

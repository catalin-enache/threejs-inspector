import type { BindingParams } from 'tweakpane';
import { useAppStore } from 'src/store';
import { useEffect } from 'react';

export interface CustomControlProps {
  name: string;
  object?: Record<string, any>;
  prop?: string;
  control: BindingParams & { onChange?: (value: any) => void; onClick?: (value: any) => void };
  path?: string;
}

// This component does not react on prop changes, it just sets up the custom control in the store
export const CustomControl = (props: CustomControlProps) => {
  useEffect(() => {
    const { name, prop, control, path = '', object } = props;
    const pathArray = path
      .split('/')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    const setOrUpdateCPanelCustomParams = useAppStore.getState().setOrUpdateCPanelCustomParams;
    const removeCPanelCustomParams = useAppStore.getState().removeCPanelCustomParams;
    const triggerCPanelCustomParamsStructureChanged = useAppStore.getState().triggerCPanelCustomParamsStructureChanged;

    setOrUpdateCPanelCustomParams(name, object, prop, control, pathArray);
    triggerCPanelCustomParamsStructureChanged();

    return () => {
      removeCPanelCustomParams(name, pathArray);
      triggerCPanelCustomParamsStructureChanged();
    };
  }, []);

  return null;
};

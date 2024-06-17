import { BindingParams } from 'tweakpane';
import { useAppStore } from 'src/store';
import { useEffect } from 'react';

interface CustomControlProps {
  name: string;
  object: any;
  prop: string;
  control: BindingParams;
  path?: string;
}

export const CustomControl = (props: CustomControlProps) => {
  const { name, prop, control, path = '', object } = props;
  const setOrUpdateCPanelCustomParams_2 = useAppStore((state) => state.setOrUpdateCPanelCustomParams);
  const removeCPanelCustomParams_2 = useAppStore((state) => state.removeCPanelCustomParams);
  const triggerCPanelCustomParamsStructureChanged_2 = useAppStore(
    (state) => state.triggerCPanelCustomParamsStructureChanged
  );

  // console.log('CustomControl_2', name);
  useEffect(() => {
    const pathArray = path
      .split('/')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    setOrUpdateCPanelCustomParams_2(name, object, prop, control, pathArray);
    triggerCPanelCustomParamsStructureChanged_2();
    return () => {
      removeCPanelCustomParams_2(name, pathArray);
      triggerCPanelCustomParamsStructureChanged_2();
    };
  }, []);

  return null;
};

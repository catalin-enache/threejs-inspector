import { useEffect, useRef, memo } from 'react';
import { BindingParams } from 'tweakpane';
import { useAppStore } from 'src/store.ts';
import { isEqual, shallowClone } from 'lib/utils';

interface CustomControlProps {
  name: string;
  initialValue: any;
  control: BindingParams;
  onChange?: (value: any) => void;
}

export const CustomControl = memo((props: CustomControlProps) => {
  const { name, onChange } = props;
  const cPanelCustomParams = useAppStore((state) => state.cPanelCustomParams);
  const cPanelOwnedCustomParamsRef = useRef(null);
  const setCPanelCustomParams = useAppStore(
    (state) => state.setCPanelCustomParams
  );
  const triggerCPanelCustomParamsChanged = useAppStore(
    (state) => state.triggerCPanelCustomParamsChanged
  );
  const removeCPanelCustomParams = useAppStore(
    (state) => state.removeCPanelCustomParams
  );
  const cPanelCustomParamsStateFake = useAppStore(
    (state) => state.cPanelCustomParamsStateFake
  );
  const setCPanelCustomControls = useAppStore(
    (state) => state.setCPanelCustomControls
  );
  const removeCPanelCustomControls = useAppStore(
    (state) => state.removeCPanelCustomControls
  );

  // Note: we need deep comparison here since .current is a copy (always different).
  // The copy is needed because Tweakpane updates params in place
  useEffect(() => {
    if (
      !isEqual(cPanelOwnedCustomParamsRef.current, cPanelCustomParams[name]) &&
      cPanelCustomParams[name] !== undefined
    ) {
      onChange?.(cPanelCustomParams[name]);
      // Note: Tweakpane updates params in place, so we need to make a copy
      cPanelOwnedCustomParamsRef.current = shallowClone(
        cPanelCustomParams[name]
      );
    }
  }, [name, onChange, cPanelCustomParamsStateFake, cPanelCustomParams]);

  useEffect(() => {
    setCPanelCustomParams(props.name, props.initialValue);
    setCPanelCustomControls(props.name, props.control);
    triggerCPanelCustomParamsChanged();
    return () => {
      removeCPanelCustomParams(props.name);
      removeCPanelCustomControls(props.name);
      triggerCPanelCustomParamsChanged();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- we want these to run once
  }, []);
  return null;
}, isEqual);

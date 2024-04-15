import { useEffect, useRef, memo } from 'react';
import { BindingParams } from 'tweakpane';
import { useAppStore } from 'src/store';
import { isEqual, shallowClone } from 'lib/utils';

interface CustomControlProps {
  name: string;
  control: BindingParams;
  value: any;
  onChange?: (value: any) => void;
}

/*
The props that CustomControl reacts to are "value" and "onChange".
"name" and control are read only once at initialization time.
Old value and new value are compared using shallow compare.
The old value is cached in cachedValueRef.
Flow:
 - cPanel updates a binding for custom param in place (mutation)
    and calls triggerCPanelCustomParamsChanged which changes cPanelCustomParamsStateFake
 - we react to cPanelCustomParamsStateFake and call onChange
 - the app can use the value reported in onChange to make other updates including updating other CustomControls
 - due to this the app will also send back the new value to the CustomControl that called onChange
   but since it is the same value the component will do nothing.
 - if the value changes from the app, the component will update the store by calling setCPanelCustomParams
*/
export const CustomControl = memo((props: CustomControlProps) => {
  const { onChange, value } = props;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const cPanelCustomParams = useAppStore((state) => state.cPanelCustomParams);
  const cachedValueRef = useRef(null);
  const removeCPanelCustomParams = useAppStore(
    (state) => state.removeCPanelCustomParams
  );
  const cPanelCustomParamsStateFake = useAppStore(
    (state) => state.cPanelCustomParamsStateFake
  );
  const setCPanelCustomControls = useAppStore(
    (state) => state.setCPanelCustomControls
  );
  const setOrUpdateCPanelCustomParams = useAppStore(
    (state) => state.setOrUpdateCPanelCustomParams
  );
  const removeCPanelCustomControls = useAppStore(
    (state) => state.removeCPanelCustomControls
  );

  // Read from store and call onChange
  // cPanelCustomParamsStateFake notifies for every change in cPanelCustomParams
  // (done in cPanel by observing the bindings to cPanelCustomParams)
  // Note: we need deep comparison here since .current is a copy (always different).
  // The copy is needed because Tweakpane updates params in place
  useEffect(() => {
    const valueFromPanel = cPanelCustomParams[props.name];
    // if (props.name === 'myPoint') {
    //   console.log(
    //     'CustomControl cPanelCustomParamsStateFake',
    //     props.name,
    //     'old',
    //     cPanelCustomParams[props.name], //?.toFixed(2),
    //     'new',
    //     value //.toFixed(2)
    //   );
    // }
    if (
      valueFromPanel !== undefined &&
      !isEqual(cachedValueRef.current, valueFromPanel) &&
      !isEqual(valueFromPanel, value)
    ) {
      // Note: Tweakpane updates params in place.
      // We need to make a copy so that cachedValueRef is not mutated
      // and also react state to not get mutated.
      const clonedValue = shallowClone(valueFromPanel);
      cachedValueRef.current = clonedValue;
      onChangeRef.current?.(clonedValue); // with a clone setState detects changes
    }
  }, [value, cPanelCustomParamsStateFake]);

  // Read from value and set on store
  useEffect(() => {
    // if (props.name === 'myPoint') {
    //   console.log(
    //     'CustomControl value changed',
    //     props.name,
    //     'old',
    //     cPanelCustomParams[props.name], //?.toFixed(2),
    //     'new',
    //     value //.toFixed(2)
    //   );
    // }
    if (!isEqual(cachedValueRef.current, value) && value !== undefined) {
      const clonedValue = shallowClone(value);
      cachedValueRef.current = clonedValue;
      // setOrUpdateCPanelCustomParams does not replace objects but mutates them
      // in order to not make Tweakpane control stale objects.
      setOrUpdateCPanelCustomParams(props.name, clonedValue);
      // useAppStore.getState().triggerCPanelCustomParamsChanged() is not needed.
      // CustomControl is interested in its own value.
      // Other controls can be changed by reacting to onChange from this control.
    }
  }, [value]);

  useEffect(() => {
    // using shallowClone so that cPanel won't mutate React state value
    const clonedValue = shallowClone(props.value);
    setOrUpdateCPanelCustomParams(props.name, clonedValue);
    setCPanelCustomControls(props.name, props.control);
    // useAppStore.getState().triggerCPanelCustomParamsChanged();
    return () => {
      removeCPanelCustomParams(props.name);
      removeCPanelCustomControls(props.name);
      // useAppStore.getState().triggerCPanelCustomParamsChanged();
    };
    // name and control are read only once
    // eslint-disable-next-line react-hooks/exhaustive-deps -- we want these to run once
  }, []);
  return null;
}, isEqual);

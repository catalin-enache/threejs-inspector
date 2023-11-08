import { useEffect, useRef, useCallback, useState } from 'react';
import { UINumber } from '../../lib/ui/ui';
import './InputNumber.css';

export const InputNumber = ({
  label = '',
  value = 0,
  min = -Infinity,
  max = Infinity,
  step = 1,
  nudge = 1,
  className = '',
  onChange = (value) => console.log(value)
}) => {
  const [, setUpdateNow] = useState(0);
  const inputRef = useRef(null);
  const labelRef = useRef(null);
  const lastOnChangeListener = useRef(null);

  const forceUpdate = useCallback(
    () =>
      setUpdateNow((state) => {
        return (state + 1) % 3;
      }),
    []
  );

  const handleChange = useCallback(() => {
    onChange(inputRef.current?.getValue());
  }, [onChange]);

  inputRef.current?.setValue(value);
  inputRef.current?.setStep(step);
  inputRef.current?.setNudge(nudge);
  inputRef.current?.setRange(min, max);

  const onDomReady = useCallback((ref) => {
    if (!ref) {
      labelRef.current = null;
      inputRef.current = null;
      return;
    }
    labelRef.current = ref;
    const uiNumber = new UINumber();
    inputRef.current = uiNumber;
    labelRef.current.appendChild(inputRef.current.dom);
    inputRef.current.dom.addEventListener('change', handleChange);
    forceUpdate();
  }, []);

  useEffect(() => {
    if (!inputRef.current) {
      return;
    }
    const lastOnChange = lastOnChangeListener.current;
    inputRef.current.dom.removeEventListener('change', lastOnChange);
    inputRef.current.dom.addEventListener('change', handleChange);
    lastOnChangeListener.current = handleChange;
  }, [handleChange]);

  return (
    <label className={`inputNumberLabel ${className}`} ref={onDomReady}>
      {label}
    </label>
  );
};

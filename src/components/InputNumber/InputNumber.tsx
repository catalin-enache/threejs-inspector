/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef, useCallback, useState } from 'react';
// @ts-ignore
import { UINumber } from 'lib/ui/ui';
import './InputNumber.css';

interface InputNumberProps {
  label?: string;
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  nudge?: number;
  className?: string;
  onChange?: (value: number) => void;
}

export const InputNumber = ({
  label = '',
  value = 0,
  min = -Infinity,
  max = Infinity,
  step = 1,
  nudge = 1,
  className = '',
  onChange = (value) => console.log(value)
}: InputNumberProps) => {
  const [, setUpdateNow] = useState(0);
  const inputRef = useRef<any>(null);
  const labelRef = useRef<HTMLElement | null>(null);
  const lastOnChangeListener = useRef<any>(null);

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

  const onDomReady = useCallback((ref: HTMLElement | null) => {
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

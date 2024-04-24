import { useEffect, useRef, useCallback, useState } from 'react';
// @ts-ignore
import { UINumber, UIInteger } from 'lib/ui/ui';
import 'components/InputNumber/InputNumber.css';

interface InputNumberProps {
  type?: 'float' | 'integer';
  precision?: number;
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
  type = 'float',
  precision = 2,
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
  const [isEditing, setIsEditing] = useState(false);
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

  const handleFocus = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
  }, []);

  !isEditing && inputRef.current?.setValue(value);
  inputRef.current?.setStep(step);
  inputRef.current?.setNudge(nudge);
  inputRef.current?.setRange(min, max);
  type === 'float' && inputRef.current?.setPrecision(precision);

  const onDomReady = useCallback((ref: HTMLElement | null) => {
    if (!ref) {
      labelRef.current = null;
      inputRef.current = null;
      return;
    }
    labelRef.current = ref;
    const uiNumber = type === 'float' ? new UINumber() : new UIInteger();
    inputRef.current = uiNumber;
    labelRef.current.appendChild(inputRef.current.dom);
    inputRef.current.dom.addEventListener('change', handleChange);
    inputRef.current.dom.addEventListener('focus', handleFocus);
    inputRef.current.dom.addEventListener('blur', handleBlur);
    inputRef.current?.setValue(value);
    inputRef.current.setStep(step);
    inputRef.current.setNudge(nudge);
    inputRef.current.setRange(min, max);
    type === 'float' && inputRef.current.setPrecision(precision);
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

  useEffect(() => {
    if (!inputRef.current) {
      return;
    }
    return () => {
      inputRef.current?.dom.removeEventListener(
        'change',
        lastOnChangeListener.current
      );
      inputRef.current?.dom.removeEventListener('focus', handleFocus);
      inputRef.current?.dom.removeEventListener('blur', handleBlur);
    };
  }, []);

  return (
    <label className={`inputNumberLabel ${className}`} ref={onDomReady}>
      {label}
    </label>
  );
};

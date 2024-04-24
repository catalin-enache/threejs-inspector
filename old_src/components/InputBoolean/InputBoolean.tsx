import React, { useCallback } from 'react';
import './InputBoolean.css';
interface InputBooleanProps {
  label?: string;
  value?: boolean;
  className?: string;
  onChange?: (value: boolean) => void;
}
export const InputBoolean = (props: InputBooleanProps) => {
  const {
    label = '',
    className = '',
    value = false,
    onChange = (evt) => {
      console.log(evt);
    }
  } = props;
  const handleChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (evt) => {
      onChange(evt.target.checked);
    },
    [onChange]
  );
  return (
    <label className={`inputLabel ${className}`}>
      {label}
      <input
        type="checkbox"
        className={`inputBoolean`}
        checked={value}
        onChange={handleChange}
      ></input>
    </label>
  );
};

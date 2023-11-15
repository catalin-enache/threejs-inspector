import React, { useCallback } from 'react';
import './InputSelect.css';
interface InputSelectProps {
  label?: string;
  value?: string;
  options?: string[];
  className?: string;
  onChange?: (value: string) => void;
}
export const InputSelect = (props: InputSelectProps) => {
  const {
    label = '',
    className = '',
    options = [],
    value = '',
    onChange = (evt) => {
      console.log(evt);
    }
  } = props;
  const handleChange = useCallback<React.ChangeEventHandler<HTMLSelectElement>>(
    (evt) => {
      onChange(evt.target.value);
    },
    [onChange]
  );
  return (
    <label className={`inputLabel ${className}`}>
      {label}
      <select className={`inputSelect`} value={value} onChange={handleChange}>
        {options?.map((option, index) => {
          return (
            <option key={index} value={option}>
              {option}
            </option>
          );
        })}
      </select>
    </label>
  );
};

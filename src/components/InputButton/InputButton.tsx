import React, { useCallback, useEffect, useState } from 'react';
import './InputButton.css';
interface InputButtonProps {
  label?: string;
  className?: string;
  value?: number;
  defaultValue?: number;
  step?: number;
  precision?: number;
  rate?: number;
  onClick?: (value: any) => void;
}
export const InputButton = (props: InputButtonProps) => {
  const {
    label = '',
    className = '',
    value = 0,
    defaultValue = 0,
    step = 1,
    precision = 2,
    rate = 100,
    onClick = () => {
      console.log(props.label, 'click');
    }
  } = props;

  const [isContinuous, setIsContinuous] = useState(false);
  const timeoutRef = React.useRef<number | null>(null);

  const handlePointerUp = useCallback<React.PointerEventHandler<HTMLElement>>(
    (event) => {
      if (event && event.button === 2) {
        event.preventDefault();
        onClick(defaultValue);
        return;
      }
      clearTimeout(timeoutRef.current!);
      setIsContinuous(false);
      onClick(Number((value + step).toFixed(precision)));
    },
    [onClick, value, step, precision]
  );

  const handlePointerDown = useCallback<React.PointerEventHandler<HTMLElement>>(
    (event) => {
      if (event && event.button === 2) {
        event.preventDefault();
        return;
      }
      clearTimeout(timeoutRef.current!);
      timeoutRef.current = setTimeout(() => {
        setIsContinuous(true);
      }, 500) as unknown as number;
    },
    [onClick, value, step, precision]
  );

  useEffect(() => {
    if (isContinuous) {
      const interval = setInterval(() => {
        onClick(Number((value + step).toFixed(precision)));
      }, rate);
      return () => {
        clearInterval(interval);
      };
    }
  }, [isContinuous, onClick, value, step, precision, rate]);

  return (
    <label
      className={`inputLabel inputButton ${className} `}
      onContextMenu={(e) => e.preventDefault()}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      {`${label} (${value})`}
    </label>
  );
};

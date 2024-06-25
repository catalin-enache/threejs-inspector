export const debounce = (fn: (...args: any[]) => void, delay: number) => {
  let timeout: NodeJS.Timeout | null = null;
  return function (...args: any[]) {
    timeout && clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

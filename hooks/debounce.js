export const debounce = (fn, delay) => {
  let timeoutId;

  const debouncedFunction = (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };

  // Add a cancel method to clear the timeout
  debouncedFunction.cancel = () => {
    clearTimeout(timeoutId);
  };

  return debouncedFunction;
};
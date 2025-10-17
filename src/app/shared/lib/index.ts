export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutID: ReturnType<typeof setTimeout> | null;

  return function (...args: Parameters<T>) {
    if (timeoutID) {
      clearTimeout(timeoutID);
    }

    timeoutID = setTimeout(() => {
      timeoutID = null;
      fn(...args);
    }, delay);
  };
}

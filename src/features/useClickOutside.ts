import { useDidMountEffect } from '@/shared/hooks/useDidMountEffect';
import { CustomEvents } from '@/shared/interfaces';

type ClickOutsideTarget = React.RefObject<HTMLElement | null>;

export const useClickOutside = (
  targets: ClickOutsideTarget | ClickOutsideTarget[],
  callback: (...arg: unknown[]) => void,
) => {
  useDidMountEffect(() => {
    const listener = (e: Event) => {
      const isClickInside = Array.isArray(targets)
        ? targets.some((target) => target?.current?.contains(<HTMLElement>e.target))
        : targets?.current?.contains(<HTMLElement>e.target);

      if (!isClickInside && !e.defaultPrevented) {
        window.dispatchEvent(new CustomEvent(CustomEvents.OUT_CLICK, { detail: e }));
        callback();
      }
    };

    document.addEventListener('click', listener, true);
    return () => document.removeEventListener('click', listener, true);
  });
};

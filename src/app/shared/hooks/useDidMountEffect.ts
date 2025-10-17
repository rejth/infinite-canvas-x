import { useEffect } from 'react';

export const useDidMountEffect = (callback: React.EffectCallback) => {
  // eslint-disable-next-line
  useEffect(callback, []);
};

import { useEffect } from 'react'

export const useDidMountEffect = (callback: React.EffectCallback) => {
  // oxlint-disable-next-line eslint-plugin-react-hooks/exhaustive-deps
  useEffect(callback, [])
}

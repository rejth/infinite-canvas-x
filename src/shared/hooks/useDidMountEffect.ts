import { useEffect } from 'react'

export const useDidMountEffect = (callback: React.EffectCallback) => {
  useEffect(callback, [])
}

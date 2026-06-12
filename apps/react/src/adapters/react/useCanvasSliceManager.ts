import { useContext } from 'react'

import { CanvasSliceManagerContext } from './CanvasSliceManagerContext'

export function useCanvasSliceManager() {
  const manager = useContext(CanvasSliceManagerContext)

  if (!manager) {
    throw new Error('useCanvasSliceManager must be used within CanvasAppProvider')
  }

  return manager
}

import { useContext } from 'react'
import type { CanvasApp } from '@infinite-canvas-x/canvas-app'

import { CanvasAppContext } from './CanvasAppContext'

export function useCanvasApp(): CanvasApp | null {
  return useContext(CanvasAppContext)
}

import type { CanvasApp } from '@infinite-canvas-x/canvas-app'
import type { Accessor } from 'solid-js'
import { useContext } from 'solid-js'

import { CanvasAppContext } from './CanvasAppContext'

export function useCanvasApp(): Accessor<CanvasApp | null> {
  const context = useContext(CanvasAppContext)

  if (!context) {
    throw new Error('useCanvasApp must be used within CanvasAppProvider')
  }

  return context
}

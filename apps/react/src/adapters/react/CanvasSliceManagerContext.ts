import { createContext } from 'react'
import type { CanvasSliceSubscriptionManager } from '@infinite-canvas-x/canvas-app'

export const CanvasSliceManagerContext = createContext<CanvasSliceSubscriptionManager | null>(null)

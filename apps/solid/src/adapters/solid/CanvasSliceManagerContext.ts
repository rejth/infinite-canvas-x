import type { CanvasSliceSubscriptionManager } from '@infinite-canvas-x/canvas-app'
import { createContext } from 'solid-js'

export const CanvasSliceManagerContext = createContext<CanvasSliceSubscriptionManager>()

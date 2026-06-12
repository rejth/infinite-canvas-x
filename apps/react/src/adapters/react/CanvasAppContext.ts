import { createContext } from 'react'
import type { CanvasApp } from '@infinite-canvas-x/canvas-app'

export const CanvasAppContext = createContext<CanvasApp | null>(null)

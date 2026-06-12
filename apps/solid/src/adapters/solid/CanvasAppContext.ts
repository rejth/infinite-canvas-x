import type { CanvasApp } from '@infinite-canvas-x/canvas-app'
import type { Accessor } from 'solid-js'
import { createContext } from 'solid-js'

export const CanvasAppContext = createContext<Accessor<CanvasApp | null>>()

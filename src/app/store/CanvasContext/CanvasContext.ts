import { createContext } from 'react'
import type { BaseRenderManager, Camera, Renderer } from '@infinite-canvas-x/canvas-engine'

export interface CanvasContextInterface {
  renderer: Renderer | null
  renderManager: BaseRenderManager | null
  camera: Camera | null
}

export const CanvasContext = createContext<CanvasContextInterface>({
  renderer: null,
  renderManager: null,
  camera: null,
})

import { canvasSliceDefinitions, canvasSliceKeys } from '@infinite-canvas-x/canvas-app'

import type { CanvasSliceRefMap } from './keys'

export function createDefaultSliceRefs(): CanvasSliceRefMap {
  return Object.fromEntries(
    canvasSliceKeys.map((key) => [key, canvasSliceDefinitions[key].defaults]),
  ) as CanvasSliceRefMap
}

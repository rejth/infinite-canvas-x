import {
  CanvasEntitySubtype,
  CanvasRect,
  Colors,
  DEFAULT_SCALE,
  DEFAULT_TEXT_AREA_HEIGHT,
  DEFAULT_TEXT_AREA_WIDTH,
  Layer,
  type Point,
} from '@infinite-canvas-x/canvas-engine'

import type { CanvasAppState } from '../CanvasAppState'
import { Tools } from '../types'

export function createTextArea(
  state: CanvasAppState,
  point: Point,
  onDoubleClick: (
    e: MouseEvent,
    layer: import('@infinite-canvas-x/canvas-engine').LayerInterface,
  ) => void,
  e: MouseEvent,
): void {
  const { renderManager } = state
  if (!renderManager) return

  const { x, y } = point

  const textArea = new CanvasRect(
    {
      x,
      y,
      width: DEFAULT_TEXT_AREA_WIDTH,
      height: DEFAULT_TEXT_AREA_HEIGHT,
      color: Colors.TRANSPARENT,
      scale: DEFAULT_SCALE,
    },
    CanvasEntitySubtype.TEXT,
  )

  const layer = new Layer({
    x,
    y,
    width: DEFAULT_TEXT_AREA_WIDTH,
    height: DEFAULT_TEXT_AREA_HEIGHT,
    scale: DEFAULT_SCALE,
  })

  layer.addChild(textArea)
  layer.setActive(true)
  renderManager.addLayer(layer)

  state.setActiveLayer(layer)
  onDoubleClick(e, layer)
  state.setTool(Tools.SELECT)
  state.setFontSize(62)
}

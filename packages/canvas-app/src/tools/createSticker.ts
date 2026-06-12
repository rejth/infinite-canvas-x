import {
  CanvasRect,
  DEFAULT_RECT_SIZE,
  DEFAULT_SCALE,
  Layer,
  type Point,
} from '@infinite-canvas-x/canvas-engine'

import type { CanvasAppState } from '../CanvasAppState'
import { StickerColors, Tools } from '../types'

export function createSticker(
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

  const sticker = new CanvasRect({
    x,
    y,
    width: DEFAULT_RECT_SIZE,
    height: DEFAULT_RECT_SIZE,
    color: StickerColors.STICKER_YELLOW,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffsetY: 10,
    shadowOffsetX: 3,
    shadowBlur: 5,
    scale: DEFAULT_SCALE,
  })

  const layer = new Layer({
    x,
    y,
    width: DEFAULT_RECT_SIZE,
    height: DEFAULT_RECT_SIZE,
    scale: DEFAULT_SCALE,
  })

  layer.addChild(sticker)
  layer.setActive(true)
  renderManager.addLayer(layer)

  state.setActiveLayer(layer)
  onDoubleClick(e, layer)
  state.setTool(Tools.SELECT)
}

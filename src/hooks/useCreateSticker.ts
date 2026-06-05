import {
  CanvasRect,
  DEFAULT_RECT_SIZE,
  DEFAULT_SCALE,
  Layer,
  Point,
  SMALL_PADDING,
} from '@infinite-canvas-x/canvas-engine'

import { Colors } from '@/shared/constants'
import { Tools } from '@/shared/interfaces'

import { useCanvasOnDoubleClick } from '@/hooks/useCanvasOnDoubleClick'
import { useActiveLayerContext, useCanvasContext, useToolbarContext } from '@/store'

export const useCreateSticker = () => {
  const { renderManager } = useCanvasContext()
  const { setActiveLayer } = useActiveLayerContext()
  const { setTool } = useToolbarContext()

  const showTextEditor = useCanvasOnDoubleClick()

  return function (e: React.MouseEvent<HTMLCanvasElement>, { x, y }: Point) {
    if (!renderManager) return

    const sticker = new CanvasRect({
      x,
      y,
      width: DEFAULT_RECT_SIZE,
      height: DEFAULT_RECT_SIZE,
      color: Colors.STICKER_YELLOW,
      shadowColor: 'rgba(0, 0, 0, 0.3)',
      shadowOffsetY: 10,
      shadowOffsetX: 3,
      shadowBlur: 5,
      scale: DEFAULT_SCALE,
    })

    const layer = new Layer({
      x: x - SMALL_PADDING,
      y: y - SMALL_PADDING,
      width: DEFAULT_RECT_SIZE + SMALL_PADDING * 2,
      height: DEFAULT_RECT_SIZE + SMALL_PADDING * 2,
      scale: DEFAULT_SCALE,
    })

    layer.addChild(sticker)
    layer.setActive(true)
    renderManager.addLayer(layer)

    setActiveLayer(layer)
    showTextEditor(e, layer)
    setTool(Tools.SELECT)
  }
}

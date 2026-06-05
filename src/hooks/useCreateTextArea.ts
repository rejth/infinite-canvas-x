import {
  CanvasEntitySubtype,
  CanvasRect,
  Colors,
  DEFAULT_SCALE,
  DEFAULT_TEXT_AREA_HEIGHT,
  DEFAULT_TEXT_AREA_WIDTH,
  Layer,
  Point,
  SMALL_PADDING,
} from '@infinite-canvas-x/canvas-engine'

import { Tools } from '@/shared/interfaces'

import { useCanvasOnDoubleClick } from '@/hooks/useCanvasOnDoubleClick'
import {
  useActiveLayerContext,
  useCanvasContext,
  useTextEditorContext,
  useToolbarContext,
} from '@/store'

export const useCreateTextArea = () => {
  const { renderManager } = useCanvasContext()
  const { setActiveLayer } = useActiveLayerContext()
  const { setTool } = useToolbarContext()
  const { setFontSize } = useTextEditorContext()

  const showTextEditor = useCanvasOnDoubleClick()

  return function (e: React.MouseEvent<HTMLCanvasElement>, { x, y }: Point) {
    if (!renderManager) return

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
      x: x - SMALL_PADDING,
      y: y - SMALL_PADDING,
      width: DEFAULT_TEXT_AREA_WIDTH + SMALL_PADDING * 2,
      height: DEFAULT_TEXT_AREA_HEIGHT + SMALL_PADDING * 2,
      scale: DEFAULT_SCALE,
    })

    layer.addChild(textArea)
    layer.setActive(true)
    renderManager.addLayer(layer)

    setActiveLayer(layer)
    showTextEditor(e, layer)
    setTool(Tools.SELECT)
    setFontSize(62)
  }
}

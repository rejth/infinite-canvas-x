import {
  CanvasEntitySubtype,
  CanvasEntityType,
  CanvasText,
  DEFAULT_FONT,
  DEFAULT_RECT_SIZE,
  DEFAULT_TEXT_AREA_HEIGHT,
  DEFAULT_TEXT_AREA_WIDTH,
  isCanvasRect,
  TextDecoration,
} from '@infinite-canvas-x/canvas-engine'

import { useActiveLayerContext, useCanvasContext, useTextEditorContext } from '@/app/store'

export function useCreateText() {
  const { renderer } = useCanvasContext()
  const { activeLayer } = useActiveLayerContext()
  const { text, textAlign, fontSize, bold, italic, underline } = useTextEditorContext()

  return function () {
    if (!activeLayer || !renderer) return

    const rect = activeLayer.getChildByType(CanvasEntityType.RECT)
    if (!rect || !isCanvasRect(rect)) return

    const [x, y] = rect.getXY()
    const scale = rect.getScale()
    const { initialPixelRatio } = renderer.getCanvasOptions()
    const textDecoration = underline ? TextDecoration.UNDERLINE : TextDecoration.NONE
    const font = DEFAULT_FONT
    const isTextArea = rect.getSubtype() === CanvasEntitySubtype.TEXT

    let fontStyle = ''
    if (italic) fontStyle = `${fontStyle} italic`
    if (bold) fontStyle = `${fontStyle} bold`

    const width = isTextArea ? DEFAULT_TEXT_AREA_WIDTH : DEFAULT_RECT_SIZE
    const height = isTextArea ? DEFAULT_TEXT_AREA_HEIGHT : DEFAULT_RECT_SIZE

    const canvasText = new CanvasText({
      x,
      y,
      width,
      height,
      text,
      textAlign,
      textDecoration,
      font,
      fontSize,
      fontStyle,
      scale,
      canvasScale: initialPixelRatio,
    })

    activeLayer.addChild(canvasText)
  }
}

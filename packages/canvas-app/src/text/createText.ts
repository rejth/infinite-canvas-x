import {
  CanvasEntitySubtype,
  CanvasEntityType,
  CanvasText,
  DEFAULT_FONT,
  DEFAULT_RECT_SIZE,
  DEFAULT_TEXT_AREA_HEIGHT,
  DEFAULT_TEXT_AREA_WIDTH,
  isCanvasRect,
  type LayerInterface,
  type Renderer,
  TextDecoration,
} from '@infinite-canvas-x/canvas-engine'

import type { CanvasAppState } from '../CanvasAppState'

export function createText(
  state: CanvasAppState,
  activeLayer: LayerInterface,
  renderer: Renderer,
): void {
  const rect = activeLayer.getChildByType(CanvasEntityType.RECT)
  if (!rect || !isCanvasRect(rect)) return

  const [x, y] = rect.getXY()
  const scale = rect.getScale()
  const { initialPixelRatio } = renderer.getCanvasOptions()
  const textDecoration = state.underline ? TextDecoration.UNDERLINE : TextDecoration.NONE
  const font = DEFAULT_FONT
  const isTextArea = rect.getSubtype() === CanvasEntitySubtype.TEXT

  let fontStyle = ''
  if (state.italic) fontStyle = `${fontStyle} italic`
  if (state.bold) fontStyle = `${fontStyle} bold`

  const width = isTextArea ? DEFAULT_TEXT_AREA_WIDTH : DEFAULT_RECT_SIZE
  const height = isTextArea ? DEFAULT_TEXT_AREA_HEIGHT : DEFAULT_RECT_SIZE

  const canvasText = new CanvasText({
    x,
    y,
    width,
    height,
    text: state.text,
    textAlign: state.textAlign,
    textDecoration,
    font,
    fontSize: state.fontSize,
    fontStyle,
    scale,
    canvasScale: initialPixelRatio,
  })

  activeLayer.addChild(canvasText)
}

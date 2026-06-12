import {
  CanvasEntityType,
  isCanvasText,
  type LayerInterface,
  TextDecoration,
} from '@infinite-canvas-x/canvas-engine'

import type { CanvasAppState } from '../CanvasAppState'

import { createText } from './createText'

export function saveText(
  state: CanvasAppState,
  activeLayer: LayerInterface | null,
  createTextFn: () => void,
): void {
  if (!activeLayer || !state.isLayerEditable) return

  const textChild = activeLayer.getChildByType(CanvasEntityType.TEXT)
  const options = textChild?.getOptions()

  if (!textChild && state.text) {
    createTextFn()
  } else if (textChild && isCanvasText(textChild) && (state.text || state.text !== options?.text)) {
    const textDecoration = state.underline ? TextDecoration.UNDERLINE : TextDecoration.NONE

    let fontStyle = ''
    if (state.italic) fontStyle = `${fontStyle} italic`
    if (state.bold) fontStyle = `${fontStyle} bold`

    textChild.setText(state.text, state.fontSize, fontStyle, state.textAlign, textDecoration)
  }
}

export function saveTextWithRenderer(state: CanvasAppState): void {
  const { activeLayer, renderer } = state
  if (!activeLayer || !renderer) return

  saveText(state, activeLayer, () => createText(state, activeLayer, renderer))
}
